import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger.js'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { miningHandlerIx } from '../ix/fleet-state-handler.js'
import { stopMiningIx } from '../ix/stop-mining.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'
import { Mineable } from '../state/world-map.js'

export const endMine = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    mineable: Mineable,
): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.MineAsteroid) {
        logger.warn('Fleet is not mining, cannot End Mine')

        return
    }

    const [
        foodToken,
        ammoToken,
        resourceFromToken,
        resourceToToken,
        fuelToken,
    ] = [
        createAssociatedTokenAccountIdempotent(
            game.data.mints.food,
            fleet.data.cargoHold,
            true,
        ),
        createAssociatedTokenAccountIdempotent(
            game.data.mints.ammo,
            fleet.data.ammoBank,
            true,
        ),
        createAssociatedTokenAccountIdempotent(
            mineable.mineItem.data.mint,
            mineable.resource.data.mineItem,
            true,
        ),
        createAssociatedTokenAccountIdempotent(
            mineable.mineItem.data.mint,
            fleet.data.cargoHold,
            true,
        ),
        createAssociatedTokenAccountIdempotent(
            game.data.mints.fuel,
            fleet.data.fuelTank,
            true,
        ),
    ]

    await ixReturnsToIxs(
        [
            foodToken.instructions,
            ammoToken.instructions,
            resourceFromToken.instructions,
            resourceToToken.instructions,
            miningHandlerIx(
                fleetInfo,
                player,
                mineable,
                foodToken.address,
                ammoToken.address,
                resourceFromToken.address,
                resourceToToken.address,
                programs,
                game,
            ),
        ],
        player.signer,
    ).then(sendAndConfirmInstructions())

    await ixReturnsToIxs(
        [
            fuelToken.instructions,
            stopMiningIx(
                fleetInfo,
                player,
                game,
                mineable,
                fuelToken.address,
                programs,
            ),
        ],
        player.signer,
    ).then(sendAndConfirmInstructions())
}
