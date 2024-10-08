import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { movementSubwarpHandlerIx } from '../ix/movement-subwarp-handler'
import { stopWarpIx } from '../ix/stop-warp'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

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

    await sendAndConfirmInstructions(instructions)
}
