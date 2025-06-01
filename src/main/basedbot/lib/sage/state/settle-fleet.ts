import { Game } from '@staratlas/sage'

import { now } from '../../../../../dayjs.js'
import { logger } from '../../../../../logger.js'
import { endMove } from '../act/end-move.js'
import { exitRespawn } from '../act/exit-respawn.js'

import { Player } from './user-account.js'
import { FleetInfo } from './user-fleets.js'

export const settleFleet = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
): Promise<void> => {
    switch (fleetInfo.fleetState.type) {
        case 'MoveWarp': {
            const { warpFinish } = fleetInfo.fleetState.data

            if (warpFinish.isBefore(now())) {
                await endMove(fleetInfo, player, game)
            }
            break
        }
        case 'MoveSubwarp': {
            const { arrivalTime } = fleetInfo.fleetState.data

            if (arrivalTime.isBefore(now())) {
                await endMove(fleetInfo, player, game)
            }
            break
        }
        case 'Respawn': {
            const { ETA } = fleetInfo.fleetState.data

            if (ETA.isBefore(now())) {
                await exitRespawn(fleetInfo, player.homeStarbase, player, game)
            }
            break
        }
        default:
            logger.debug(
                `${fleetInfo.fleetName} is ${fleetInfo.fleetState.type}`,
            )
    }
}
