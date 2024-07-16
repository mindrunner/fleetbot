import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { startMiningIx } from '../ix/start-mining'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'
import { Mineable } from '../state/world-map'

import { undock } from './undock'

export const mine = async (
    fleetInfo: FleetInfo,
    player: Player,
    mineable: Mineable,
): Promise<void> => {
    const { fleet } = fleetInfo

    // TOOD: Check fuel cost for mining

    if (fleet.state.MineAsteroid) {
        logger.warn('Fleet is already mining')

        return
    }

    if (fleet.state.StarbaseLoadingBay) {
        logger.info(
            `${fleetInfo.fleetName} is in the loading bay at ${fleet.state.StarbaseLoadingBay.starbase}, undocking...`,
        )

        await undock(fleet, fleetInfo.location, player)
    }

    if (fleet.state.MoveSubwarp || fleet.state.MoveWarp) {
        logger.info(`${fleetInfo.fleetName} is moving, cannot mine`)

        return
    }
    const starbasePlayer = await getStarbasePlayer(
        player,
        mineable.starbase,
        programs,
    )
    const fuelTokenAccount = createAssociatedTokenAccountIdempotent(
        player.game.data.mints.fuel,
        fleet.data.fuelTank,
        true,
    )

    const ix = startMiningIx(
        fleetInfo,
        player,
        mineable,
        starbasePlayer,
        fuelTokenAccount.address,
        programs,
    )

    const instructions = await ixReturnsToIxs(
        [fuelTokenAccount.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions(instructions)
}
