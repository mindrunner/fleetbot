import { Keypair } from '@solana/web3.js'
import { CargoPod } from '@staratlas/cargo'
import { ixReturnsToIxs, readAllFromRPC } from '@staratlas/data-source'
import { SagePlayerProfile, Starbase, StarbasePlayer } from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { StarAtlasPrograms } from '../../programs'

import { Player } from './user-account'

export const getCargoPodsForStarbasePlayer = async (
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
): Promise<CargoPod> => {
    const [cargoPod] = await readAllFromRPC(
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

    if (!cargoPod) {
        throw new Error('Error reading cargo pods')
    }

    if (cargoPod.type === 'error') {
        throw new Error('Error reading cargoPods account')
    }

    return cargoPod.data
}

export const getStarbasePlayer = async (
    player: Player,
    starbase: Starbase,
    programs: StarAtlasPrograms,
): Promise<StarbasePlayer> => {
    const [starbasePlayer] = await readAllFromRPC(
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

    if (!starbasePlayer) {
        const [sageProfileAddress] = SagePlayerProfile.findAddress(
            programs.sage,
            player.profile.key,
            player.game.key,
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
                player.game.key,
                player.game.data.gameState,
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
                player.game.data.cargo.statsDefinition,
                player.game.key,
                player.game.data.gameState,
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
