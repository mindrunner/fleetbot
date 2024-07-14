import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { miningHandlerIx } from '../ix/fleet-state-handler'
import { stopMiningIx } from '../ix/stop-mining'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'
import { Mineable } from '../state/world-map'

export const endMine = async (
    fleetInfo: FleetInfo,
    player: Player,
    mineable: Mineable,
): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.MineAsteroid) {
        logger.warn('Fleet is not mining, cannot End Mine')

        return
    }

    const ix1 = []
    const ix2 = []

    const foodTokenFromResult = createAssociatedTokenAccountIdempotent(
        player.game.data.mints.food,
        fleetInfo.fleet.data.cargoHold,
        true,
    )

    ix1.push(foodTokenFromResult.instructions)

    const ammoTokenFromResult = createAssociatedTokenAccountIdempotent(
        player.game.data.mints.ammo,
        fleetInfo.fleet.data.ammoBank,
        true,
    )

    ix1.push(ammoTokenFromResult.instructions)

    const resourceTokenFromResult = createAssociatedTokenAccountIdempotent(
        mineable.mineItem.data.mint,
        mineable.resource.data.mineItem,
        true,
    )

    ix1.push(resourceTokenFromResult.instructions)
    const resourceTokenToResult = createAssociatedTokenAccountIdempotent(
        mineable.mineItem.data.mint,
        fleetInfo.fleet.data.cargoHold,
        true,
    )

    ix1.push(resourceTokenToResult.instructions)

    ix1.push(
        miningHandlerIx(
            fleetInfo,
            player,
            mineable,
            foodTokenFromResult.address,
            ammoTokenFromResult.address,
            resourceTokenFromResult.address,
            resourceTokenToResult.address,
            programs,
        ),
    )
    ix2.push(stopMiningIx(fleetInfo, player, mineable, programs))

    await sendAndConfirmInstructions(await ixReturnsToIxs(ix1, player.signer))
    await sendAndConfirmInstructions(await ixReturnsToIxs(ix2, player.signer))
}
