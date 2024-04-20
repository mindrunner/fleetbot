import { Keypair, PublicKey } from '@solana/web3.js'
import { CargoType } from '@staratlas/cargo'
import { AsyncSigner, keypairToAsyncSigner, readAllFromRPC } from '@staratlas/data-source'
import { PlayerProfile } from '@staratlas/player-profile'
import { PointsModifier } from '@staratlas/points'
import { ProfileFactionAccount } from '@staratlas/profile-faction'
import { Game } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs, xpCategoryIds } from '../../programs'

import { getCargoType, getCargoTypes } from './cargo-types'
import { sageGame } from './game'

export type XpAccounts = {
    councilRank: XpAccount
    dataRunning: XpAccount
    piloting: XpAccount
    mining: XpAccount
    crafting: XpAccount
}

export type XpAccount = {
    userPointsAccount: PublicKey
    pointsCategory: PublicKey
    pointsModifierAccount: PublicKey
}

export type Player = {
    // TODO: what is this?
    keyIndex: number
    profile: PlayerProfile
    profileFaction: ProfileFactionAccount
    xpAccounts: XpAccounts
    signer: AsyncSigner
    game: Game
    cargoTypes: Array<CargoType>
    fuelCargoType: CargoType
    foodCargoType: CargoType
    ammoCargoType: CargoType
}

const getXpAccount = async (playerProfile: PublicKey, xpCategory: PublicKey): Promise<XpAccount> => {
    const [userXpAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('UserPointsAccount'),
            xpCategory.toBuffer(),
            playerProfile.toBuffer()
        ],
        programs.points.programId
    )

    const [pointsModifierAccount] = await readAllFromRPC(
        connection,
        programs.points,
        PointsModifier,
        'processed',
        [
            {
                memcmp: {
                    offset: 9,
                    bytes: xpCategory.toBase58()
                }
            },
        ])

    if (pointsModifierAccount.type === 'error') {throw new Error('Error reading points modifier account')}

    return {
        userPointsAccount: userXpAccount,
        pointsModifierAccount: pointsModifierAccount.key,
        pointsCategory: xpCategory
    }
}

const getKeyIndex = (_: PlayerProfile): number => 0

export const getPlayerContext = async (user: PublicKey, signer: Keypair): Promise<Player> => {
    const myProfiles = await readAllFromRPC(
        connection,
        programs.playerProfile,
        PlayerProfile,
        'processed',
        [
            {
                memcmp: {
                    offset: PlayerProfile.MIN_DATA_SIZE + 2,
                    bytes: user.toBase58()
                }
            }
        ]
    )

    // TODO: only support one profile for now

    const [profile] = myProfiles

    if (!profile) {
        throw new Error('no player profile found')
    }

    if (profile.type === 'error') {throw new Error('Error reading account')}

    const keyIndex = getKeyIndex(profile.data)

    const [profileFaction] = await readAllFromRPC(connection, programs.profileFaction as any, ProfileFactionAccount, 'processed', [
        {
            memcmp: {
                offset: 9,
                bytes: profile.key.toBase58()
            }
        }
    ])

    if (profileFaction.type === 'error') {throw new Error('Error reading faction account')}

    const xpAccounts = {
        councilRank: await getXpAccount(profile.key, new PublicKey(xpCategoryIds.councilRankXpCategory)),
        dataRunning: await getXpAccount(profile.key, new PublicKey(xpCategoryIds.dataRunningXpCategory)),
        piloting: await getXpAccount(profile.key, new PublicKey(xpCategoryIds.pilotingXpCategory)),
        mining: await getXpAccount(profile.key, new PublicKey(xpCategoryIds.miningXpCategory)),
        crafting: await getXpAccount(profile.key, new PublicKey(xpCategoryIds.craftingXpCategory))
    }

    const game = await sageGame()
    const cargoTypes = await getCargoTypes()

    return {
        profile: profile.data,
        profileFaction: profileFaction.data,
        keyIndex,
        xpAccounts,
        signer: keypairToAsyncSigner(signer),
        game,
        cargoTypes,
        fuelCargoType: getCargoType(cargoTypes, game, game.data.mints.fuel),
        foodCargoType: getCargoType(cargoTypes, game, game.data.mints.food),
        ammoCargoType: getCargoType(cargoTypes, game, game.data.mints.ammo)
    }
}

// export const getAccountName = (profileProgram: StarAtlasProgram, account: PlayerProfile): string => {
//     const playerNameAddress = PlayerName.findAddress(profileProgram.program as any, account.key)
//     const decodedPlayerName = PlayerName.decodeData({
//     accountInfo: account.accountInfo, accountId: playerNameAddress }, profileProgram.program as any)
// }
