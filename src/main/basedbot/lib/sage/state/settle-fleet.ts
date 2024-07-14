import { now } from '../../../../../dayjs'
import { logger } from '../../../../../logger'
import { Coordinates } from '../../util/coordinates'
import { endMine } from '../act/end-mine'
import { endMove } from '../act/end-move'
import { exitRespawn } from '../act/exit-respawn'

import { Player } from './user-account'
import { FleetInfo } from './user-fleets'
import { mineableByCoordinates, WorldMap } from './world-map'

export const settleFleet = async (
    fleetInfo: FleetInfo,
    player: Player,
    map: WorldMap,
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
        case 'MineAsteroid': {
            const { end } = fleetInfo.fleetState.data

            if (end.isBefore(now())) {
                const [mineable] = Array.from(
                    mineableByCoordinates(map, fleetInfo.location),
                )

                await endMine(fleetInfo, player, mineable)
            }
            break
        }
        case 'Respawn': {
            const { ETA } = fleetInfo.fleetState.data

            if (ETA.isBefore(now())) {
                // TODO: Respawn at Home Base based on Faction
                await exitRespawn(
                    fleetInfo,
                    Coordinates.fromNumber(-40, 30),
                    player,
                )
            }
            break
        }
        default:
            logger.info(
                `${fleetInfo.fleetName} is ${fleetInfo.fleetState.type}`,
            )
    }
}
