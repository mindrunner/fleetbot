import { now } from '../../../../../dayjs'
import { logger } from '../../../../../logger'
import { endMove } from '../act/end-move'
import { exitRespawn } from '../act/exit-respawn'

import { Player } from './user-account'
import { FleetInfo } from './user-fleets'

export const settleFleet = async (
    fleetInfo: FleetInfo,
    player: Player,
): Promise<void> => {
    switch (fleetInfo.fleetState.type) {
        case 'MoveWarp': {
            const { warpFinish } = fleetInfo.fleetState.data

            if (warpFinish.isBefore(now())) {
                await endMove(fleetInfo, player)
            }
            break
        }
        case 'MoveSubwarp': {
            const { arrivalTime } = fleetInfo.fleetState.data

            if (arrivalTime.isBefore(now())) {
                await endMove(fleetInfo, player)
            }
            break
        }
        case 'Respawn': {
            const { ETA } = fleetInfo.fleetState.data

            if (ETA.isBefore(now())) {
                await exitRespawn(fleetInfo, player.homeStarbase, player)
            }
            break
        }
        default:
            logger.info(
                `${fleetInfo.fleetName} is ${fleetInfo.fleetState.type}`,
            )
    }
}
