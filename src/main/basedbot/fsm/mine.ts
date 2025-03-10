import { Game } from '@staratlas/sage'
import dayjs from 'dayjs'

import { now } from '../../../dayjs'
import { logger } from '../../../logger'
import { dock } from '../lib/sage/act/dock'
import { endMine } from '../lib/sage/act/end-mine'
import { loadCargo } from '../lib/sage/act/load-cargo'
import { mine } from '../lib/sage/act/mine'
import { move } from '../lib/sage/act/move'
import { selfDestruct } from '../lib/sage/act/self-destruct'
import { undock } from '../lib/sage/act/undock'
import { unloadAllCargo } from '../lib/sage/act/unload-all-cargo'
import { starbaseByCoordinates } from '../lib/sage/state/starbase-by-coordinates'
import { Player } from '../lib/sage/state/user-account'
import { FleetInfo } from '../lib/sage/state/user-fleets'
import { getName } from '../lib/sage/util'
import { getFuelConsumption } from '../lib/util/fuel-consumption'

import { MineConfig } from './configs/mine/mine-config'
import { Strategy } from './strategy'

const transition = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    config: MineConfig,
): Promise<void> => {
    const cargoLoad = player.cargoTypes
        .filter((ct) => !ct.data.mint.equals(game.data.mints.food))
        .reduce((acc, cargoType) => {
            const load =
                fleetInfo.cargoLevels.cargo.get(
                    cargoType.data.mint.toBase58(),
                ) ?? 0

            return acc + load
        }, 0)
    const { homeBase, targetBase, resource, warpMode } = config

    const { cargoCapacity } = fleetInfo.cargoStats
    const cargoLevelFood = fleetInfo.cargoLevels.food
    const cargoLevelAmmo = fleetInfo.cargoLevels.ammo
    const cargoLevelFuel = fleetInfo.cargoLevels.fuel
    const desiredFood = cargoCapacity / 20
    const fuelReserve = fleetInfo.cargoStats.fuelCapacity
    const toLoad = desiredFood - cargoLevelFood
    const hasEnoughFood = toLoad <= 10
    const hasEnoughAmmo =
        cargoLevelAmmo >= fleetInfo.cargoStats.ammoCapacity - 100
    const hasEnoughFuel = cargoLevelFuel >= fuelReserve - 100
    const hasCargo = cargoLoad > 0
    const currentStarbase = await starbaseByCoordinates(fleetInfo.location)
    const { fleetName, location } = fleetInfo
    const resourceName = getName(resource.mineItem)
    const isAtHomeBase = homeBase.equals(location)
    const isAtTargetBase = targetBase.equals(location)
    const isSameBase = homeBase.equals(targetBase)

    logger.info(
        `${fleetName} is mining ${getName(config.resource.mineItem)} resources from ${config.targetBase} to ${config.homeBase}`,
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
            if (isAtHomeBase) {
                logger.info(`${fleetName} is at home base`)
                if (hasCargo) {
                    logger.info(
                        `${fleetName} has ${cargoLoad} ${resourceName}, docking to unload`,
                    )

                    return dock(fleetInfo, location, player, game)
                }
                if (!hasEnoughFood || !hasEnoughFuel || !hasEnoughAmmo) {
                    logger.info(
                        `${fleetName} doesn't have enough resources, docking to resupply`,
                    )

                    return dock(fleetInfo, location, player, game)
                }
                if (isSameBase) {
                    logger.info(`${fleetName} is at home/target base, mining`)

                    return mine(fleetInfo, player, game, resource)
                }
                logger.info(
                    `${fleetName} is at home base, moving to target base`,
                )

                return move(fleetInfo, targetBase, player, game, warpMode)
            }

            if (isAtTargetBase && !isSameBase) {
                logger.info(`${fleetName} is at target base`)
                if (!hasEnoughFuel) {
                    logger.info(
                        `${fleetName} doesn't have enough fuel, docking`,
                    )
                    return dock(fleetInfo, location, player, game)
                }
                if (hasCargo) {
                    logger.info(
                        `${fleetName} has ${cargoLoad} ${resourceName}, returning home`,
                    )

                    return move(fleetInfo, homeBase, player, game, warpMode)
                }
                if (hasEnoughFood) {
                    logger.info(`${fleetName} has enough food, mining`)

                    return mine(fleetInfo, player, game, resource)
                }
                logger.info(
                    `${fleetName} doesn't have enough food, returning home`,
                )

                return move(fleetInfo, homeBase, player, game, warpMode)
            }

            logger.info(`${fleetName} is at ${location}`)

            return move(
                fleetInfo,
                hasCargo || !hasEnoughFood ? homeBase : targetBase,
                player,
                game,
                warpMode,
            )
        }
        case 'StarbaseLoadingBay': {
            logger.info(
                `${fleetInfo.fleetName} is in the loading bay at ${getName(fleetInfo.fleetState.data.starbase)}`,
            )

            if (hasCargo) {
                logger.info(
                    `${fleetInfo.fleetName} has ${cargoLoad} cargo, unloading`,
                )

                return unloadAllCargo(
                    fleetInfo,
                    fleetInfo.location,
                    player,
                    game,
                )
            }

            if (!hasEnoughFuel) {
                const neededFuel =
                    fleetInfo.cargoStats.fuelCapacity - cargoLevelFuel
                logger.info(`${fleetInfo.fleetName} is refueling ${neededFuel}`)

                return loadCargo(
                    fleetInfo,
                    player,
                    game,
                    game.data.mints.fuel,
                    neededFuel,
                )
            }

            if (!hasEnoughAmmo && isAtHomeBase) {
                const neededAmmo =
                    fleetInfo.cargoStats.ammoCapacity - cargoLevelAmmo
                logger.info(`${fleetInfo.fleetName} is rearming ${neededAmmo}`)

                return loadCargo(
                    fleetInfo,
                    player,
                    game,
                    game.data.mints.ammo,
                    neededAmmo,
                )
            }

            if (!hasEnoughFood && isAtHomeBase) {
                logger.info(
                    `${fleetInfo.fleetName} is loading ${desiredFood - cargoLevelFood} food`,
                )

                return loadCargo(
                    fleetInfo,
                    player,
                    game,
                    game.data.mints.food,
                    toLoad,
                )
            }

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
            const { mineItem, end, amountMined, endReason } =
                fleetInfo.fleetState.data

            if (end.isBefore(now())) {
                logger.info(
                    `${fleetInfo.fleetName} has finished mining ${getName(mineItem)} for ${amountMined}`,
                )

                return endMine(fleetInfo, player, game, config.resource)
            }

            const log = endReason === 'FULL' ? logger.info : logger.warn

            log(
                `${fleetInfo.fleetName} mining ${getName(mineItem)} for ${amountMined}. Time remaining: ${dayjs.duration(end.diff(now())).humanize(false)} until ${endReason}`,
            )

            break
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

export const createMiningStrategy = (
    miningConfig: MineConfig,
    player: Player,
    game: Game,
): Strategy => {
    const config = miningConfig

    return {
        apply: (fleetInfo: FleetInfo): Promise<void> =>
            transition(fleetInfo, player, game, config),
    }
}
