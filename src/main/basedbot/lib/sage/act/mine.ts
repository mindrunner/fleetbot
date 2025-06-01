import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger.js'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { startMiningIx } from '../ix/start-mining.js'
import { getStarbasePlayer } from '../state/starbase-player.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'
import { Mineable } from '../state/world-map.js'

import { undock } from './undock.js'

export const mine = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
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

        await undock(fleet, fleetInfo.location, player, game)
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
        game.data.mints.fuel,
        fleet.data.fuelTank,
        true,
    )

    const ix = startMiningIx(
        fleetInfo,
        player,
        game,
        mineable,
        starbasePlayer,
        fuelTokenAccount.address,
        programs,
    )

    const instructions = await ixReturnsToIxs(
        [fuelTokenAccount.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions()(instructions)
}
