import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'

import { logger } from '../../../../../logger'
import { sleep } from '../../../../../service/sleep'
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

    const ix = []

    const foodTokenFromResult = createAssociatedTokenAccountIdempotent(
        player.game.data.mints.food,
        fleetInfo.fleet.data.cargoHold,
        true,
    )

    ix.push(foodTokenFromResult.instructions)

    const ammoTokenFromResult = createAssociatedTokenAccountIdempotent(
        player.game.data.mints.ammo,
        fleetInfo.fleet.data.ammoBank,
        true,
    )

    ix.push(ammoTokenFromResult.instructions)

    const resourceTokenFromResult = createAssociatedTokenAccountIdempotent(
        mineable.mineItem.data.mint,
        mineable.resource.data.mineItem,
        true,
    )

    ix.push(resourceTokenFromResult.instructions)
    const resourceTokenToResult = createAssociatedTokenAccountIdempotent(
        mineable.mineItem.data.mint,
        fleetInfo.fleet.data.cargoHold,
        true,
    )

    ix.push(resourceTokenToResult.instructions)

    ix.push(
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

    const instructions = await ixReturnsToIxs(ix, player.signer)

    await sendAndConfirmInstructions(instructions)

    await sleep(2000)

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(
            stopMiningIx(fleetInfo, player, mineable, programs),
            player.signer,
        ),
    )
}
