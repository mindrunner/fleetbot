import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger.js'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { movementSubwarpHandlerIx } from '../ix/movement-subwarp-handler.js'
import { stopWarpIx } from '../ix/stop-warp.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'

export const endMove = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.MoveWarp && !fleet.state.MoveSubwarp) {
        logger.warn('Fleet is not moving, cannot End Move')

        return
    }
    const fuelTokenAccount = createAssociatedTokenAccountIdempotent(
        game.data.mints.fuel,
        fleet.data.fuelTank,
        true,
    )

    const ix = (
        fleet.state.MoveSubwarp ? movementSubwarpHandlerIx : stopWarpIx
    )(fleetInfo, player, game, fuelTokenAccount.address, programs)

    const instructions = await ixReturnsToIxs(
        [fuelTokenAccount.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions()(instructions)
}
