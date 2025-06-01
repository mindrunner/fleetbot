import { Game } from '@staratlas/sage'
import dayjs from 'dayjs'

import { now } from '../../../dayjs.js'
import { logger } from '../../../logger.js'
import { disbandFleet } from '../lib/sage/act/disband-fleet.js'
import { dock } from '../lib/sage/act/dock.js'
import { endMine } from '../lib/sage/act/end-mine.js'
import { endMove } from '../lib/sage/act/end-move.js'
import { move } from '../lib/sage/act/move.js'
import { selfDestruct } from '../lib/sage/act/self-destruct.js'
import { stopSubwarp } from '../lib/sage/act/stop-subwarp.js'
import { undock } from '../lib/sage/act/undock.js'
import { starbaseByCoordinates } from '../lib/sage/state/starbase-by-coordinates.js'
import { Player } from '../lib/sage/state/user-account.js'
import { FleetInfo } from '../lib/sage/state/user-fleets.js'
import { mineableByCoordinates } from '../lib/sage/state/world-map.js'
import { getName } from '../lib/sage/util.js'

import { DisbandConfig } from './configs/disband-config.js'
import { Strategy } from './strategy.js'

const transition = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    config: DisbandConfig,
): Promise<void> => {
    const cargoLevelFuel = fleetInfo.cargoLevels.fuel
    const currentStarbase = await starbaseByCoordinates(fleetInfo.location)
    const { fleetName, location } = fleetInfo
    const { homeBase, warpMode } = config
    const isAtHomeBase = homeBase.equals(location)

    switch (fleetInfo.fleetState.type) {
        case 'Idle': {
            logger.info(
                `${fleetName} is idle at ${fleetInfo.fleetState.data.sector} [Starbase: ${currentStarbase ? getName(currentStarbase) : 'N/A'}]`,
            )

            if (!currentStarbase && cargoLevelFuel < 1) {
                logger.warn(
                    `${fleetName} is out of fuel and not at a starbase, need self destruction`,
                )

                return selfDestruct(fleetInfo, player, game)
            }
            if (isAtHomeBase) {
                logger.info(`${fleetName} is at home base, docking to disband`)

                return dock(fleetInfo, location, player, game)
            }

            logger.info(`${fleetName} is at ${location} warping home`)

            return move(fleetInfo, homeBase, player, game, warpMode)
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
                logger.info(
                    `Wrong direction, stopping fleet ${fleetInfo.fleetName}`,
                )

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
                logger.info(
                    `Wrong direction, stopping fleet ${fleetInfo.fleetName}`,
                )

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
                getName(mineItem),
            )

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

export const createDisbandStrategy = (
    config: DisbandConfig,
    player: Player,
    game: Game,
): Strategy => {
    return {
        apply: (fleetInfo: FleetInfo): Promise<void> =>
            transition(fleetInfo, player, game, config),
    }
}
