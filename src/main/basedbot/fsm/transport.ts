import { Game } from '@staratlas/sage'
import dayjs from 'dayjs'

import { now } from '../../../dayjs'
import { logger } from '../../../logger'
import { Resource } from '../../../service/wallet'
import { getTokenBalance } from '../basedbot'
import { dock } from '../lib/sage/act/dock'
import { loadCargo } from '../lib/sage/act/load-cargo'
import { move, WarpMode } from '../lib/sage/act/move'
import { selfDestruct } from '../lib/sage/act/self-destruct'
import { undock } from '../lib/sage/act/undock'
import { getHold, unloadCargo } from '../lib/sage/act/unload-cargo'
import { starbaseByCoordinates } from '../lib/sage/state/starbase-by-coordinates'
import { Player } from '../lib/sage/state/user-account'
import { FleetInfo } from '../lib/sage/state/user-fleets'
import { WorldMap } from '../lib/sage/state/world-map'
import { getName } from '../lib/sage/util'
import { Coordinates } from '../lib/util/coordinates'
import { getFuelConsumption } from '../lib/util/fuel-consumption'

import { Strategy } from './strategy'

const transition = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    config: TransportConfig,
): Promise<void> => {
    const cargoLoad = player.cargoTypes.reduce((acc, cargoType) => {
        const load =
            fleetInfo.cargoLevels.cargo.get(cargoType.data.mint.toBase58()) ?? 0

        return acc + load
    }, 0)

    const { homeBase, targetBase, resources, warpMode } = config
    const fuelConsumption = getFuelConsumption(homeBase, targetBase, fleetInfo)

    const { cargoCapacity } = fleetInfo.cargoStats
    const cargoLevelFuel = fleetInfo.cargoLevels.fuel
    const cargoLevelAmmo = fleetInfo.cargoLevels.ammo
    const cargoLevel = Array.from(fleetInfo.cargoLevels.cargo.values()).reduce(
        (acc, curr) => acc + curr,
        0,
    )

    const fuelReserve = Math.ceil(fuelConsumption.auto * 1.1)
    const ammoReserve = fleetInfo.cargoStats.ammoCapacity
    const hasEnoughFuel = cargoLevelFuel >= fuelReserve
    const hasEnoughAmmo = cargoLevelAmmo >= ammoReserve
    const hasCargo = cargoLoad > 0
    const currentStarbase = await starbaseByCoordinates(fleetInfo.location)
    const { fleetName, location } = fleetInfo
    const isAtHomeBase = homeBase.equals(location)
    const isAtTargetBase = targetBase.equals(location)
    const isSameBase = homeBase.equals(targetBase)

    logger.info(
        `${fleetName} is transporting ${config.resources.size} resources from ${config.homeBase} to ${config.targetBase}`,
    )

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
            if (isSameBase) {
                logger.warn(
                    `${fleetName} is configured as transport fleet with home and target being the same. Idling....`,
                )

                return Promise.resolve()
            }
            if (isAtHomeBase) {
                logger.info(`${fleetName} is at home base`)
                if (hasEnoughAmmo && hasEnoughFuel && hasCargo) {
                    logger.info('Ready to go! Moving to target base')

                    return move(fleetInfo, targetBase, player, game, warpMode)
                }
                logger.info(`${fleetName} is docking to resupply`)

                return dock(fleetInfo, location, player, game)
            }

            if (isAtTargetBase) {
                logger.info(`${fleetName} is at target base`)

                if (hasCargo) {
                    logger.info(
                        `${fleetName} docking to unload ${cargoLoad} cargo`,
                    )
                    return dock(fleetInfo, location, player, game)
                }

                if (!hasEnoughFuel) {
                    logger.info(`${fleetName} docking to refuel.`)

                    return dock(fleetInfo, location, player, game)
                }

                if (hasEnoughFuel && !hasCargo) {
                    logger.info('Ready to go! Moving to target base')

                    return move(fleetInfo, homeBase, player, game, warpMode)
                }
            }

            logger.warn(`${fleetName} doesn't know what to do`)

            return Promise.resolve()
        }

        case 'StarbaseLoadingBay': {
            logger.info(
                `${fleetInfo.fleetName} is in the loading bay at ${getName(fleetInfo.fleetState.data.starbase)}`,
            )

            if (isAtHomeBase) {
                if (!hasEnoughFuel) {
                    const neededFuel =
                        fleetInfo.cargoStats.fuelCapacity - cargoLevelFuel
                    logger.info(
                        `${fleetInfo.fleetName} is refueling ${neededFuel}`,
                    )

                    await loadCargo(
                        fleetInfo,
                        player,
                        game,
                        game.data.mints.fuel,
                        neededFuel,
                    )
                }
                if (!hasEnoughAmmo) {
                    const neededAmmo =
                        fleetInfo.cargoStats.ammoCapacity - cargoLevelAmmo
                    logger.info(
                        `${fleetInfo.fleetName} is rearming ${neededAmmo}`,
                    )

                    await loadCargo(
                        fleetInfo,
                        player,
                        game,
                        game.data.mints.ammo,
                        neededAmmo,
                    )
                }

                if (!hasCargo) {
                    logger.info(`Loading ${Array.from(resources).length} cargo`)
                    const cargoResources = Array.from(resources).filter(
                        (resource) => !resource.equals(game.data.mints.fuel),
                    )

                    await Promise.all(
                        cargoResources.map((resource) => {
                            const count = Math.floor(
                                (cargoCapacity - cargoLevel) /
                                    Array.from(cargoResources).length,
                            )

                            logger.info(
                                `Loading ${count} ${resource.toBase58()}`,
                            )

                            return loadCargo(
                                fleetInfo,
                                player,
                                game,
                                resource,
                                count,
                                true,
                            )
                        }),
                    )
                }

                logger.info(`${fleetName} is undocking...`)

                return undock(fleetInfo.fleet, fleetInfo.location, player, game)
            }

            if (isAtTargetBase) {
                if (hasCargo) {
                    logger.info(
                        `Unloading ${Array.from(resources).length} cargo`,
                    )

                    await Promise.all(
                        Array.from(resources).map(async (resource) => {
                            const fleetCargoPod = getHold(
                                resource,
                                game,
                                fleetInfo,
                            )
                            const amount = await getTokenBalance(
                                fleetCargoPod,
                                resource,
                            )

                            logger.info(
                                `Unloading ${amount} ${resource.toBase58()}`,
                            )

                            await unloadCargo(
                                fleetInfo,
                                player,
                                game,
                                resource,
                                amount,
                            )
                        }),
                    )
                }

                if (!hasEnoughFuel) {
                    const neededFuel = fuelReserve - cargoLevelFuel
                    logger.info(
                        `${fleetInfo.fleetName} is refueling ${neededFuel}`,
                    )

                    await loadCargo(
                        fleetInfo,
                        player,
                        game,
                        game.data.mints.fuel,
                        neededFuel,
                    )
                }
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

export type TransportConfig = {
    map: WorldMap
    homeBase: Coordinates
    targetBase: Coordinates
    resources: Set<Resource>
    warpMode: WarpMode
}

export const transportConfig = (
    config: Partial<TransportConfig> & {
        map: WorldMap
        homeBase: Coordinates
        targetBase: Coordinates
        resources: Set<Resource>
    },
): TransportConfig => ({
    map: config.map,
    homeBase: config.homeBase,
    targetBase: config.targetBase,
    resources: config.resources,
    warpMode: config.warpMode || 'auto',
})

export const transport = (
    map: WorldMap,
    homeBase: Coordinates,
    targetBase: Coordinates,
    resources: Set<Resource>,
): TransportConfig =>
    transportConfig({
        map,
        homeBase,
        targetBase,
        resources,
        warpMode: 'subwarp',
    })

export const createTransportStrategy = (
    config: TransportConfig,
    player: Player,
    game: Game,
): Strategy => {
    return {
        apply: (fleetInfo: FleetInfo): Promise<void> =>
            transition(fleetInfo, player, game, config),
    }
}
