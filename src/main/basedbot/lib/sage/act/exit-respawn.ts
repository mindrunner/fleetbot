import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { CargoType } from '@staratlas/cargo'
import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import { Game, Starbase } from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { exitRespawnIx } from '../ix/exit-respawn'
import { forceDropFleetCargoIx } from '../ix/force-drop-fleet-cargo'
import { getCargoStatsDefinition } from '../state/cargo-stats-definition'
import { getCargoType } from '../state/cargo-types'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

import { getFleetCargoHold } from './load-cargo'

export const exitRespawn = async (
    fleetInfo: FleetInfo,
    starbase: Starbase,
    player: Player,
    game: Game,
): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.Respawn) {
        logger.warn('Fleet is not respawning, cannot Exit Respawn')

        return
    }

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const cargoStatsDefinition = await getCargoStatsDefinition(
        game.data.cargo.statsDefinition,
    )

    const ixs: Array<InstructionReturn> = []

    const cargoMints = player.cargoTypes.map((ct) => ct.data.mint)

    for (const key of cargoMints) {
        const mint = new PublicKey(key)
        let cargoType: CargoType | undefined
        try {
            cargoType = getCargoType(player.cargoTypes, game, mint)
        } catch (e) {
            logger.error((e as any).message)
        }

        const cargoPod = getFleetCargoHold(mint, game, fleetInfo)
        const tokenFrom = getAssociatedTokenAddressSync(mint, cargoPod, true)

        const accountInfo = await connection.getAccountInfo(tokenFrom)

        if (accountInfo && cargoType) {
            ixs.push(
                forceDropFleetCargoIx(
                    fleetInfo,
                    game,
                    cargoStatsDefinition,
                    cargoPod,
                    cargoType.key,
                    tokenFrom,
                    mint,
                    programs,
                ),
            )
        }
    }
    ixs.push(
        exitRespawnIx(
            fleetInfo,
            player,
            game,
            starbase,
            starbasePlayer,
            programs,
        ),
    )
    await ixReturnsToIxs(ixs, player.signer).then(sendAndConfirmInstructions)
}
