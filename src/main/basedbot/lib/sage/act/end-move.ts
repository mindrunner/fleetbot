import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { stopSubWarpIx } from '../ix/stop-subwarp'
import { stopWarpIx } from '../ix/stop-warp'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const endMove = async (
    fleetInfo: FleetInfo,
    player: Player,
): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.MoveWarp && !fleet.state.MoveSubwarp) {
        logger.warn('Fleet is not moving, cannot End Move')

        return
    }
    const fuelTokenAccount = createAssociatedTokenAccountIdempotent(
        player.game.data.mints.fuel,
        fleet.data.fuelTank,
        true,
    )

    const ix = (fleet.state.MoveSubwarp ? stopSubWarpIx : stopWarpIx)(
        fleetInfo,
        player,
        fuelTokenAccount.address,
        programs,
    )

    const instructions = await ixReturnsToIxs(
        [fuelTokenAccount.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions(instructions)
}
