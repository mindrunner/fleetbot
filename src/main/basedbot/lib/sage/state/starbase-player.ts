import { Keypair, PublicKey } from '@solana/web3.js'
import { CargoPod } from '@staratlas/cargo'
import { ixReturnsToIxs, readAllFromRPC } from '@staratlas/data-source'
import {
    Game,
    SagePlayerProfile,
    Ship,
    Starbase,
    StarbasePlayer,
} from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { StarAtlasPrograms } from '../../programs'

import { sageGame } from './game'
import { Player } from './user-account'

export const getCargoPodsForStarbasePlayer = async (
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
): Promise<CargoPod> => {
    const cargoPods = await readAllFromRPC(
        connection,
        programs.cargo,
        CargoPod,
        'processed',
        [
            {
                memcmp: {
                    offset: 8 + 1 + 32,
                    bytes: starbasePlayer.key.toBase58(),
                },
            },
        ],
    )

    if (cargoPods.length > 1) {
        logger.warn(
            `${starbasePlayer.data.starbase.toBase58()} has ${cargoPods.length} cargo pods`,
        )
    }

    const cargoPod = cargoPods[0]

    if (!cargoPod) {
        throw new Error('Error reading cargo pods')
    }

    if (cargoPod.type === 'error') {
        throw new Error('Error reading cargoPods account')
    }

    return cargoPod.data
}

export const getShipByMint = async (
    mint: PublicKey,
    game: Game,
    programs: StarAtlasPrograms,
): Promise<Ship> => {
    const ships = await readAllFromRPC(
        connection,
        programs.sage,
        Ship,
        'processed',
        [
            {
                memcmp: {
                    offset: 8 + 1,
                    bytes: game.key.toString(),
                },
            },
            {
                memcmp: {
                    offset: 8 + 1 + 32,
                    bytes: mint.toString(),
                },
            },
        ],
    )

    const ship = ships.find(
        (s) =>
            s.type === 'ok' &&
            (s.data.data as any).next.key.toString() ===
                '11111111111111111111111111111111',
    )

    if (!ship) {
        throw new Error('Error reading ship')
    }

    if (ship.type === 'error') {
        throw new Error('Error reading ship account')
    }

    return ship.data
}

export const getStarbasePlayer = async (
    player: Player,
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
                    bytes: player.profile.key.toBase58(),
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

    const game = await sageGame()

    if (starbasePlayers.length > 1) {
        throw new Error('Multiple starbase players found')
    }
    const [starbasePlayer] = starbasePlayers

    if (!starbasePlayer) {
        const [sageProfileAddress] = SagePlayerProfile.findAddress(
            programs.sage,
            player.profile.key,
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
                player.profileFaction.key,
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
                player.signer,
                player.profile.key,
                player.profileFaction.key,
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
            player: player.profile.key.toBase58(),
            starbase: starbase.key.toBase58(),
        })
        await sendAndConfirmInstructions(
            await ixReturnsToIxs(instructionReturns, player.signer),
        )

        return getStarbasePlayer(player, starbase, programs)
    }

    if (starbasePlayer.type === 'error') {
        throw new Error('Error reading starbasePlayer account')
    }

    return starbasePlayer.data
}
