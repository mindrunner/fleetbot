import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger.js'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { stopSubWarpIx } from '../ix/stop-subwarp.js'
import { getCargoStatsDefinition } from '../state/cargo-stats-definition.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'

import { endMove } from './end-move.js'

export const stopSubwarp = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.MoveSubwarp) {
        logger.warn('Fleet is not subwarping, cannot End Subwarp')

        return
    }

    const fuelToken = createAssociatedTokenAccountIdempotent(
        game.data.mints.fuel,
        fleet.data.fuelTank,
        true,
    )

    await ixReturnsToIxs(
        [
            fuelToken.instructions,
            stopSubWarpIx(
                fleetInfo,
                player,
                game,
                await getCargoStatsDefinition(game.data.cargo.statsDefinition),
                fuelToken.address,
                game.data.mints.fuel,
                programs,
            ),
        ],
        player.signer,
    ).then(sendAndConfirmInstructions())
    await endMove(fleetInfo, player, game)
}
