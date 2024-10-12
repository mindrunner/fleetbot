import { Game } from '@staratlas/sage'
import dayjs from 'dayjs'

import { now } from '../../../dayjs'
import { logger } from '../../../logger'
import { disbandFleet } from '../lib/sage/act/disband-fleet'
import { dock } from '../lib/sage/act/dock'
import { endMine } from '../lib/sage/act/end-mine'
import { endMove } from '../lib/sage/act/end-move'
import { selfDestruct } from '../lib/sage/act/self-destruct'
import { stopSubwarp } from '../lib/sage/act/stop-subwarp'
import { undock } from '../lib/sage/act/undock'
import { starbaseByCoordinates } from '../lib/sage/state/starbase-by-coordinates'
import { Player } from '../lib/sage/state/user-account'
import { FleetInfo } from '../lib/sage/state/user-fleets'
import { mineableByCoordinates, WorldMap } from '../lib/sage/state/world-map'
import { getName } from '../lib/sage/util'

import { DisbandConfig } from './configs/disband-config'
import { Strategy } from './strategy'

// eslint-disable-next-line complexity
const transition = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    config: DestructConfig,
): Promise<void> => {
    const currentStarbase = await starbaseByCoordinates(fleetInfo.location)
    const { fleetName, location } = fleetInfo
    const homeBase = player.homeCoordinates
    const isAtHomeBase = homeBase.equals(location)

    switch (fleetInfo.fleetState.type) {
        case 'Idle': {
            logger.info(
                `${fleetName} is idle at ${fleetInfo.fleetState.data.sector} [Starbase: ${currentStarbase ? getName(currentStarbase) : 'N/A'}]`,
            )

            if (isAtHomeBase) {
                logger.info(`${fleetName} is at home base, docking to disband`)

                return dock(fleetInfo, location, player, game)
            }

            return selfDestruct(fleetInfo, player, game)
        }
        case 'StarbaseLoadingBay': {
            logger.info(
                `${fleetInfo.fleetName} is in the loading bay at ${getName(fleetInfo.fleetState.data.starbase)}`,
            )

            if (isAtHomeBase) {
                logger.info(
                    `${fleetInfo.fleetName} is at home base, disbanding...`,
                )

                return disbandFleet(
                    player,
                    game,
                    player.homeStarbase,
                    fleetInfo,
                )
            }
            logger.info(
                `${fleetInfo.fleetName} is at ${location}, undocking...`,
            )

            return undock(fleetInfo.fleet, fleetInfo.location, player, game)
        }
        case 'MoveWarp': {
            const { fromSector, toSector, warpFinish } =
                fleetInfo.fleetState.data

            if (!homeBase.equals(toSector)) {
                logger.info(`Stopping fleet ${fleetInfo.fleetName}`)

                return endMove(fleetInfo, player, game)
            }

            if (warpFinish.isBefore(now())) {
                logger.info(
                    `${fleetInfo.fleetName} has arrived at ${fleetInfo.fleetState.data.toSector}`,
                )
            } else {
                logger.info(
                    `${fleetInfo.fleetName} warping from ${fromSector} to ${toSector}. Arrival in ${dayjs.duration(warpFinish.diff(now())).humanize(false)}. Current Position: ${fleetInfo.location}`,
                )
            }
            break
        }
        case 'MoveSubwarp': {
            const { fromSector, toSector, arrivalTime } =
                fleetInfo.fleetState.data

            if (!homeBase.equals(toSector)) {
                logger.info(`Stopping fleet ${fleetInfo.fleetName}`)

                return stopSubwarp(fleetInfo, player, game)
            }

            if (arrivalTime.isBefore(now())) {
                logger.info(
                    `${fleetInfo.fleetName} has arrived at ${fleetInfo.fleetState.data.toSector}`,
                )
            } else {
                logger.info(
                    `${fleetInfo.fleetName} subwarping from ${fromSector} to ${toSector}. Arrival in ${dayjs.duration(arrivalTime.diff(now())).humanize(false)}. Current Position: ${fleetInfo.location}`,
                )
            }
            break
        }
        case 'MineAsteroid': {
            const { mineItem, end, amountMined } = fleetInfo.fleetState.data

            if (end.isBefore(now())) {
                logger.info(
                    `${fleetInfo.fleetName} has finished mining ${getName(mineItem)} for ${amountMined}`,
                )
            }

            logger.info(
                `${fleetInfo.fleetName} mining ${getName(mineItem)} for ${amountMined}. Ending...`,
            )
            const resource = mineableByCoordinates(
                config.worldMap,
                fleetInfo.location,
            )
                .values()
                .next().value

            return endMine(fleetInfo, player, game, resource)
        }
        case 'Respawn': {
            const { destructionTime, ETA } = fleetInfo.fleetState.data

            if (ETA.isBefore(now())) {
                logger.info(`${fleetInfo.fleetName} has respawned`)
            } else {
                logger.info(
                    `${fleetInfo.fleetName} respawning at ${fleetInfo.fleetState.data.sector}. ETA: ${dayjs.duration(ETA.diff(now())).humanize(false)}. Destruction time: ${destructionTime}`,
                )
            }
            break
        }
        default:
            logger.info(
                `${fleetInfo.fleetName} is ${fleetInfo.fleetState.type}`,
            )

            return Promise.resolve()
    }
}

export type DestructConfig = {
    worldMap: WorldMap
}

export const destructConfig = (
    config: Partial<DisbandConfig> & {
        worldMap: WorldMap
    },
): DestructConfig => ({
    worldMap: config.worldMap,
})

export const createDestructStrategy = (
    config: DestructConfig,
    player: Player,
    game: Game,
): Strategy => {
    return {
        apply: (fleetInfo: FleetInfo): Promise<void> =>
            transition(fleetInfo, player, game, config),
    }
}
