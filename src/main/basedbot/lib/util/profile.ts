import { Keypair, PublicKey } from '@solana/web3.js'
import {
    AsyncSigner,
    InstructionReturn,
    ixReturnsToIxs,
    keypairToAsyncSigner,
    readAllFromRPC,
} from '@staratlas/data-source'
import {
    PlayerProfile,
    ProfileKeyInput,
    ProfilePermissions,
} from '@staratlas/player-profile'
import { UserPoints } from '@staratlas/points'
import { ProfileFactionAccount } from '@staratlas/profile-faction'
import {
    Game,
    SagePlayerProfile,
    Starbase,
    StarbasePlayer,
} from '@staratlas/sage'
import { airdrop, airdropCrew, airdropSol } from '../../../../lib/airdrop'
import { logger } from '../../../../logger'
import { connection } from '../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../service/sol/send-and-confirm-tx'
import { keyPair } from '../../../../service/wallet'
import { programs, StarAtlasPrograms } from '../programs'
import { starbaseByCoordinates } from '../sage/state/starbase-by-coordinates'
import { Faction, galaxySectorsData } from './galaxy-sectors-data'
import { config } from '../../../../config'

export const getStarbasePlayer = async (
    keyPair: Keypair,
    game: Game,
    playerProfile: PublicKey,
    profileFaction: PublicKey,
    starbase: Starbase,
    programs: StarAtlasPrograms,
): Promise<StarbasePlayer> => {
    const starbasePlayers = await readAllFromRPC(
        connection,
        programs.sage,
        StarbasePlayer,
        'processed',
        [
            {
                memcmp: {
                    offset: 9,
                    bytes: playerProfile.toBase58(),
                },
            },
            {
                memcmp: {
                    offset: 73,
                    bytes: starbase.key.toBase58(),
                },
            },
        ],
    )

    if (starbasePlayers.length > 1) {
        throw new Error('Multiple starbase players found')
    }
    const [starbasePlayer] = starbasePlayers

    if (!starbasePlayer) {
        const [sageProfileAddress] = SagePlayerProfile.findAddress(
            programs.sage,
            playerProfile,
            game.key,
        )
        const [starbasePlayerAddress] = StarbasePlayer.findAddress(
            programs.sage,
            starbase.key,
            sageProfileAddress,
            starbase.data.seqId,
        )

        const instructionReturns = [
            StarbasePlayer.registerStarbasePlayer(
                programs.sage,
                profileFaction,
                sageProfileAddress,
                starbase.key,
                game.key,
                game.data.gameState,
                starbase.data.seqId,
            ),
            StarbasePlayer.createCargoPod(
                programs.sage,
                programs.cargo,
                starbasePlayerAddress,
                keypairToAsyncSigner(keyPair),
                playerProfile,
                profileFaction,
                starbase.key,
                game.data.cargo.statsDefinition,
                game.key,
                game.data.gameState,
                {
                    keyIndex: 0,
                    podSeeds: Array.from(
                        Keypair.generate().publicKey.toBuffer(),
                    ),
                },
            ),
        ]

        logger.warn('Starbase player not found, creating', {
            player: playerProfile.toBase58(),
            starbase: starbase.key.toBase58(),
        })
        await sendAndConfirmInstructions()(
            await ixReturnsToIxs(
                instructionReturns,
                keypairToAsyncSigner(keyPair),
            ),
        )

        return getStarbasePlayer(
            keyPair,
            game,
            playerProfile,
            profileFaction,
            starbase,
            programs,
        )
    }

    if (starbasePlayer.type === 'error') {
        throw new Error('Error reading starbasePlayer account')
    }

    return starbasePlayer.data
}

const getCategory = (category: any): PublicKey => {
    if ('category' in category) {
        return new PublicKey(category.category)
    }

    throw new Error('Category not found')
}

const getCreatePlayerPointsAccountsIxs = (
    game: Game,
    character: PublicKey,
): InstructionReturn[] => {
    const pilotXPAccountIx = createCharacterUserPointAccount(
        character,
        getCategory(game.data.points.pilotXpCategory),
    )

    const dataRunningXPAccountIx = createCharacterUserPointAccount(
        character,
        getCategory(game.data.points.dataRunningXpCategory),
    )

    const councilRankXpAccountIx = createCharacterUserPointAccount(
        character,
        getCategory(game.data.points.councilRankXpCategory),
    )

    const miningXpAccountIx = createCharacterUserPointAccount(
        character,
        getCategory(game.data.points.miningXpCategory),
    )

    const craftingXpAccountIx = createCharacterUserPointAccount(
        character,
        getCategory(game.data.points.craftingXpCategory),
    )

    const lpAccountIx = createCharacterUserPointAccount(
        character,
        getCategory(game.data.points.lpCategory),
    )

    return [
        pilotXPAccountIx.instructions,
        dataRunningXPAccountIx.instructions,
        councilRankXpAccountIx.instructions,
        miningXpAccountIx.instructions,
        craftingXpAccountIx.instructions,
        lpAccountIx.instructions,
    ]
}

export const createNewCharacter = (
    characterProfileKeypair: AsyncSigner,
    signer: AsyncSigner,
): {
    character: PublicKey
    instruction: InstructionReturn
} => {
    logger.info(characterProfileKeypair.publicKey().toBase58())
    logger.info(signer.publicKey().toBase58())
    const instructions = PlayerProfile.createProfile(
        programs.playerProfile,
        characterProfileKeypair,
        [
            {
                key: signer,
                expireTime: null,
                scope: programs.playerProfile.programId,
                permissions: ProfilePermissions.all(),
            },
        ],
        1,
    )

    return {
        character: characterProfileKeypair.publicKey(),
        instruction: instructions,
    }
}

export const setCharacterName = (
    signer: AsyncSigner,
    character: {
        key: PublicKey
        index: number
    },
    name: string,
) => {
    const keyInput: ProfileKeyInput<ProfilePermissions, AsyncSigner> = {
        playerProfileProgram: programs.playerProfile,
        profileKey: character.key,
        key: signer,
        keyIndex: character.index,
    }

    return PlayerProfile.setName(programs.playerProfile, keyInput, name)
}

export const setCharacterFaction = (
    signer: AsyncSigner,
    character: {
        key: PublicKey
        index: number
    },
    faction: Faction,
) => {
    const keyInput: ProfileKeyInput<ProfilePermissions, AsyncSigner> = {
        playerProfileProgram: programs.playerProfile,
        profileKey: character.key,
        key: signer,
        keyIndex: character.index,
    }

    return ProfileFactionAccount.chooseFaction(
        programs.profileFaction,
        keyInput,
        faction.valueOf(),
    )
}

export const createCharacterUserPointAccount = (
    player: PublicKey,
    category: PublicKey,
) => {
    return UserPoints.createUserPointAccount(programs.points, player, category)
}

export const createAndInitializeCharacter = async (
    game: Game,
    name: string,
    faction: Faction,
) => {
    await airdropSol(
        config.app.airdropUrl,
        config.app.airdropToken,
        keyPair.publicKey,
        10,
    )
    const signer = keypairToAsyncSigner(keyPair)
    const characterKeyPair = Keypair.generate()
    const characterProfileSigner = keypairToAsyncSigner(characterKeyPair)
    const characterInstruction = createNewCharacter(
        characterProfileSigner,
        signer,
    )
    const character = characterInstruction.character
    const nameIx = setCharacterName(signer, { key: character, index: 0 }, name)
    const factionIx = setCharacterFaction(
        signer,
        { key: character, index: 0 },
        faction,
    )
    if (!nameIx || !factionIx || !nameIx.instructions.length) {
        throw new Error('Failed to create name or faction instruction')
    }
    const userPointsIxs = getCreatePlayerPointsAccountsIxs(game, character)
    const profileIx = SagePlayerProfile.registerSagePlayerProfile(
        programs.sage,
        character,
        game.key,
        game.data.gameState,
    )

    await ixReturnsToIxs([characterInstruction.instruction], signer).then(
        sendAndConfirmInstructions([keyPair, characterKeyPair]),
    )

    await ixReturnsToIxs(
        [
            nameIx.instructions,
            factionIx.instructions,
            profileIx,
            ...userPointsIxs,
        ],
        signer,
    ).then(sendAndConfirmInstructions([keyPair]))

    const homeCoordinates = galaxySectorsData()
        .filter((sector) => sector.closestFaction === faction)
        .find((sector) => sector.name.includes('CSS'))?.coordinates

    if (!homeCoordinates) {
        throw new Error('No home coordinates found')
    }

    if (!homeCoordinates) {
        throw new Error('No home coordinates found')
    }

    const homeStarbase = await starbaseByCoordinates(homeCoordinates)

    if (!homeStarbase) {
        throw new Error('No home starbase found')
    }
    const profiles = await readAllFromRPC(
        connection,
        programs.playerProfile,
        PlayerProfile,
        'processed',
        [
            {
                memcmp: {
                    offset: PlayerProfile.MIN_DATA_SIZE + 2,
                    bytes: keyPair.publicKey.toBase58(),
                },
            },
        ],
    )

    const [profile] = profiles

    await getStarbasePlayer(
        keyPair,
        game,
        profile.key,
        factionIx.faction[0],
        homeStarbase,
        programs,
    )

    await airdrop(
        config.app.airdropUrl,
        config.app.airdropToken,
        keyPair.publicKey,
    )

    await airdropCrew(
        config.app.airdropUrl,
        config.app.airdropToken,
        keyPair.publicKey,
        10000,
    )

    return profiles
}
