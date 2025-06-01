import dayjs, { now } from '../../../../../dayjs.js'
import { logger } from '../../../../../logger.js'
import { getName } from '../util.js'

import { planetsByCoordinates } from './planets-by-coordinates.js'
import { starbaseByCoordinates } from './starbase-by-coordinates.js'
import { FleetInfo } from './user-fleets.js'

export const showFleetInfo = async (fleetInfo: FleetInfo): Promise<void> => {
    switch (fleetInfo.fleetState.type) {
        case 'Idle': {
            const baseStation = await starbaseByCoordinates(fleetInfo.location)
            const planets = await planetsByCoordinates(fleetInfo.location)

            logger.info(
                `${fleetInfo.fleetName} is idle at ${fleetInfo.fleetState.data.sector} [BaseStation: ${baseStation ? getName(baseStation) : 'N/A'} / Planets: ${planets.length}]`,
            )
            break
        }
        case 'StarbaseLoadingBay':
            logger.info(
                `${fleetInfo.fleetName} is in the loading bay at ${getName(fleetInfo.fleetState.data.starbase)}`,
            )
            break
        case 'MoveWarp': {
            const { fromSector, toSector, warpFinish } =
                fleetInfo.fleetState.data

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
            const { mineItem, end, amountMined, endReason } =
                fleetInfo.fleetState.data

            if (end.isBefore(now())) {
                logger.info(
                    `${fleetInfo.fleetName} has finished mining ${getName(mineItem)} for ${amountMined}`,
                )
            } else {
                const log = endReason === 'FULL' ? logger.info : logger.warn

                log(
                    `${fleetInfo.fleetName} mining ${getName(mineItem)} for ${amountMined}. Time remaining: ${dayjs.duration(end.diff(now())).humanize(false)} until ${endReason}`,
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
