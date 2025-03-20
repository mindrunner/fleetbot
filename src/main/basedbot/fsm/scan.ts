import { Game } from '@staratlas/sage'
import dayjs from 'dayjs'

import { now } from '../../../dayjs'
import { logger } from '../../../logger'
import { dock } from '../lib/sage/act/dock'
import { loadCargo } from '../lib/sage/act/load-cargo'
import { move, WarpMode } from '../lib/sage/act/move'
import { scan as doScan } from '../lib/sage/act/scan'
import { selfDestruct } from '../lib/sage/act/self-destruct'
import { undock } from '../lib/sage/act/undock'
import { starbaseByCoordinates } from '../lib/sage/state/starbase-by-coordinates'
import { Player } from '../lib/sage/state/user-account'
import { FleetInfo } from '../lib/sage/state/user-fleets'
import { WorldMap } from '../lib/sage/state/world-map'
import { getName } from '../lib/sage/util'
import { Coordinates } from '../lib/util/coordinates'

import { Strategy } from './strategy'

let hasScanned: boolean = false

/**
 * Generates a random `Coordinates` instance within a specified maximum distance from a given location.
 * @param location - The central `Coordinates` instance.
 * @param maxDistance - The maximum distance from the location.
 * @returns A new `Coordinates` instance within the maxDistance from the location.
 */
export const getRandomSector = (
    location: Coordinates,
    maxDistance: number,
): Coordinates => {
    if (maxDistance <= 0) {
        throw new Error('maxDistance must be a positive number.')
    }

    // Generate a random angle between 0 and 2π
    const angle = Math.random() * 2 * Math.PI

    // Generate a random radius with uniform distribution over the circle's area
    const radius = maxDistance * Math.sqrt(Math.random())

    // Calculate the offset from the original location
    const dx = radius * Math.cos(angle)
    const dy = radius * Math.sin(angle)

    // Calculate new coordinates
    const newX = location.x + dx
    const newY = location.y + dy

    return Coordinates.fromNumber(newX, newY)
}

// eslint-disable-next-line complexity
const transition = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    config: ScanConfig,
): Promise<void> => {
    const cargoLoad = player.cargoTypes.reduce((acc, cargoType) => {
        const load =
            fleetInfo.cargoLevels.cargo.get(cargoType.data.mint.toBase58()) ?? 0

        return acc + load
    }, 0)
    // const { cargoCapacity } = fleetInfo.cargoStats
    const cargoLevelFuel = fleetInfo.cargoLevels.fuel
    const cargoLevelAmmo = fleetInfo.cargoLevels.ammo
    const fuelReserve = fleetInfo.cargoStats.fuelCapacity / 10
    const ammoReserve = 0
    const hasEnoughFuel = cargoLevelFuel >= fuelReserve
    const hasEnoughAmmo = cargoLevelAmmo >= ammoReserve
    const hasCargo = cargoLoad > 0
    const currentStarbase = await starbaseByCoordinates(fleetInfo.location)
    const { fleetName, location } = fleetInfo
    const { warpMode } = config
    const homeBase = player.homeCoordinates
    const isAtHomeBase = homeBase.equals(location)

    logger.info(`${fleetName} is doing random scans...`)

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
                logger.info(`${fleetName} is at home base`)
                if (hasEnoughAmmo && hasEnoughFuel) {
                    const dest = getRandomSector(fleetInfo.location, 10)

                    logger.info(`Ready to go! Moving to ${dest} `)

                    return move(fleetInfo, dest, player, game, warpMode)
                }
                logger.info(`${fleetName} is docking to resupply`)

                return dock(fleetInfo, location, player, game)
            }
            if (hasScanned) {
                const dest = getRandomSector(fleetInfo.location, 10)

                logger.info(`Ready to go! Moving to ${dest} `)
                hasScanned = false

                return move(fleetInfo, dest, player, game, warpMode)
            }

            await doScan(fleetInfo, player, game)
            hasScanned = true

            logger.warn(`${fleetName} doesn't know what to do`)

            return Promise.resolve()
        }

        case 'StarbaseLoadingBay': {
            logger.info(
                `${fleetInfo.fleetName} is in the loading bay at ${getName(fleetInfo.fleetState.data.starbase)}`,
            )

            if (isAtHomeBase) {
                if (!hasEnoughFuel) {
                    logger.info(`${fleetInfo.fleetName} is refueling`)

                    await loadCargo(
                        fleetInfo,
                        player,
                        game,
                        game.data.mints.fuel,
                        fleetInfo.cargoStats.fuelCapacity - cargoLevelFuel,
                    )
                }
                if (!hasEnoughAmmo) {
                    logger.info(`${fleetInfo.fleetName} is rearming`)

                    await loadCargo(
                        fleetInfo,
                        player,
                        game,
                        game.data.mints.ammo,
                        fleetInfo.cargoStats.ammoCapacity - cargoLevelAmmo,
                    )
                }

                if (!hasCargo) {
                    // logger.info(`Loading ${Array.from(resources).length} cargo`)
                    // const cargoResources = Array.from(resources).filter(
                    //     (resource) =>
                    //         !resource.equals(game.data.mints.ammo) &&
                    //         !resource.equals(game.data.mints.fuel),
                    // )
                    // await Promise.all(
                    //     cargoResources.map((resource) => {
                    //         const count = Math.floor(
                    //             cargoCapacity /
                    //                 Array.from(cargoResources).length,
                    //         )
                    //
                    //         logger.info(
                    //             `Loading ${count} ${resource.toBase58()}`,
                    //         )
                    //
                    //         return loadCargo(
                    //             fleetInfo,
                    //             player,
                    //             game,
                    //             resource,
                    //             count,
                    //         )
                    //     }),
                    // )
                }

                logger.info(`${fleetName} is undocking...`)

                return undock(fleetInfo.fleet, fleetInfo.location, player, game)
            }

            logger.info(`${fleetName} is undocking for take off`)

            return undock(fleetInfo.fleet, fleetInfo.location, player, game)
        }
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
            //TODO: Gather 'Mineable' in order to call `endMine`
            // return endMine(fleetInfo, player, game, config.resource)
            logger.warn(
                `${fleetInfo.fleetName} is currently mining, need to end mine manually.`,
            )

            return Promise.resolve()
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

export type ScanConfig = {
    map: WorldMap
    warpMode: WarpMode
}

export const scanConfig = (
    config: Partial<ScanConfig> & {
        map: WorldMap
    },
): ScanConfig => ({
    map: config.map,
    warpMode: config.warpMode || 'auto',
})

export const scan = (map: WorldMap): ScanConfig =>
    scanConfig({
        map,
        warpMode: 'auto',
    })

export const createScanningStrategy = (
    config: ScanConfig,
    player: Player,
    game: Game,
): Strategy => {
    return {
        apply: (fleetInfo: FleetInfo): Promise<void> =>
            transition(fleetInfo, player, game, config),
    }
}
