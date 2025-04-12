import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { stopSubWarpIx } from '../ix/stop-subwarp'
import { getCargoStatsDefinition } from '../state/cargo-stats-definition'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

import { endMove } from './end-move'

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
