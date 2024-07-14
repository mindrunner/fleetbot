import dayjs from 'dayjs'

import { now } from '../../../dayjs'
import { logger } from '../../../logger'
import { dock } from '../lib/sage/act/dock'
import { endMine } from '../lib/sage/act/end-mine'
import { loadCargo } from '../lib/sage/act/load-cargo'
import { mine } from '../lib/sage/act/mine'
import { move } from '../lib/sage/act/move'
import { undock } from '../lib/sage/act/undock'
import { unloadAllCargo } from '../lib/sage/act/unload-all-cargo'
import { starbaseByCoordinates } from '../lib/sage/state/starbase-by-coordinates'
import { Player } from '../lib/sage/state/user-account'
import { FleetInfo } from '../lib/sage/state/user-fleets'
import { getName } from '../lib/sage/util'

import { MineConfig } from './configs/mine-config'
import { Strategy } from './strategy'

// eslint-disable-next-line complexity
const transition = async (
    fleetInfo: FleetInfo,
    player: Player,
    config: MineConfig,
): Promise<void> => {
    const cargoLoad = player.cargoTypes
        .filter((ct) => !ct.data.mint.equals(player.game.data.mints.food))
        .reduce((acc, cargoType) => {
            const load =
                fleetInfo.cargoLevels.cargo.get(
                    cargoType.data.mint.toBase58(),
                ) ?? 0

            return acc + load
        }, 0)

    const { cargoCapacity } = fleetInfo.cargoStats
    const cargoLevelFood = fleetInfo.cargoLevels.food
    const cargoLevelAmmo = fleetInfo.cargoLevels.ammo
    const cargoLevelFuel = fleetInfo.cargoLevels.fuel
    const desiredFood = cargoCapacity / 10
    const toLoad = desiredFood - cargoLevelFood
    const hasEnoughFood = toLoad <= 10
    const hasEnoughAmmo =
        cargoLevelAmmo >= fleetInfo.cargoStats.ammoCapacity - 100
    const hasEnoughFuel =
        cargoLevelFuel >= fleetInfo.cargoStats.fuelCapacity - 100
    const hasCargo = cargoLoad > 0
    const currentStarbase = await starbaseByCoordinates(fleetInfo.location)
    const { fleetName, location } = fleetInfo
    const { homeBase, targetBase, resource, warpMode } = config
    const resourceName = getName(resource.mineItem)
    const isAtHomeBase = homeBase.equals(location)
    const isAtTargetBase = targetBase.equals(location)
    const isSameBase = homeBase.equals(targetBase)

    switch (fleetInfo.fleetState.type) {
        case 'Idle': {
            logger.info(
                `${fleetName} is idle at ${fleetInfo.fleetState.data.sector} [Starbase: ${currentStarbase ? getName(currentStarbase) : 'N/A'}]`,
            )

            if (!currentStarbase && cargoLevelFuel < 1) {
                logger.warn(
                    `Fleet: ${fleetName} is out of fuel and not at a starbase, need self destruction`,
                )

                return Promise.resolve()
            }
            if (isAtHomeBase) {
                logger.info(`Fleet: ${fleetName} is at home base`)
                if (hasCargo) {
                    logger.info(
                        `Fleet: ${fleetName} has ${cargoLoad} ${resourceName}, docking to unload`,
                    )

                    return dock(fleetInfo, location, player)
                }
                if (!hasEnoughFood || !hasEnoughFuel || !hasEnoughAmmo) {
                    logger.info(
                        `Fleet: ${fleetName} doesn't have enough resources, docking to resupply`,
                    )

                    return dock(fleetInfo, location, player)
                }
                if (isSameBase) {
                    logger.info(
                        `Fleet: ${fleetName} is at home/target base, mining`,
                    )

                    return mine(fleetInfo, player, resource)
                }
                logger.info(
                    `Fleet: ${fleetName} is at home base, moving to target base`,
                )

                return move(fleetInfo, targetBase, player, warpMode)
            }

            if (isAtTargetBase && !isSameBase) {
                logger.info(`Fleet: ${fleetName} is at target base`)
                if (hasCargo) {
                    logger.info(
                        `Fleet: ${fleetName} has ${cargoLoad} ${resourceName}, returning home`,
                    )

                    return move(fleetInfo, homeBase, player, warpMode)
                }
                if (hasEnoughFood) {
                    logger.info(`Fleet: ${fleetName} has enough food, mining`)

                    return mine(fleetInfo, player, resource)
                }
                logger.info(
                    `Fleet: ${fleetName} doesn't have enough food, returning home`,
                )

                return move(fleetInfo, homeBase, player, warpMode)
            }

            logger.info(`Fleet: ${fleetName} is at ${location}`)

            return move(
                fleetInfo,
                hasCargo || !hasEnoughFood ? homeBase : targetBase,
                player,
                warpMode,
            )
        }
        case 'StarbaseLoadingBay': {
            logger.info(
                `Fleet: ${fleetInfo.fleetName} is in the loading bay at ${getName(fleetInfo.fleetState.data.starbase)}`,
            )

            if (hasCargo) {
                logger.info(
                    `Fleet: ${fleetInfo.fleetName} has ${cargoLoad} cargo, unloading`,
                )

                return unloadAllCargo(
                    fleetInfo,
                    fleetInfo.location,
                    player,
                    fleetInfo.fleet.data.cargoHold,
                )
            }

            if (!hasEnoughFuel) {
                logger.info(`Fleet: ${fleetInfo.fleetName} is refueling`)

                return loadCargo(
                    fleetInfo,
                    player,
                    player.game.data.mints.fuel,
                    fleetInfo.fleet.data.fuelTank,
                    fleetInfo.cargoStats.fuelCapacity - cargoLevelFuel,
                )
            }

            if (!hasEnoughAmmo) {
                logger.info(`Fleet: ${fleetInfo.fleetName} is rearming`)

                return loadCargo(
                    fleetInfo,
                    player,
                    player.game.data.mints.ammo,
                    fleetInfo.fleet.data.ammoBank,
                    fleetInfo.cargoStats.ammoCapacity - cargoLevelAmmo,
                )
            }

            if (!hasEnoughFood) {
                logger.info(
                    `Fleet: ${fleetInfo.fleetName} is loading ${desiredFood - cargoLevelFood} food`,
                )

                return loadCargo(
                    fleetInfo,
                    player,
                    player.game.data.mints.food,
                    fleetInfo.fleet.data.cargoHold,
                    toLoad,
                )
            }

            return undock(fleetInfo.fleet, fleetInfo.location, player)
        }
        case 'MoveWarp': {
            const { fromSector, toSector, warpFinish } =
                fleetInfo.fleetState.data

            if (warpFinish.isBefore(now())) {
                logger.info(
                    `Fleet: ${fleetInfo.fleetName} has arrived at ${fleetInfo.fleetState.data.toSector}`,
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
                    `Fleet: ${fleetInfo.fleetName} has arrived at ${fleetInfo.fleetState.data.toSector}`,
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
                    `Fleet: ${fleetInfo.fleetName} has finished mining ${getName(mineItem)} for ${amountMined}`,
                )

                return endMine(fleetInfo, player, config.resource)
            }

            const log = endReason === 'FULL' ? logger.info : logger.warn

            log(
                `Fleet: ${fleetInfo.fleetName} mining ${getName(mineItem)} for ${amountMined}. Time remaining: ${dayjs.duration(end.diff(now())).humanize(false)} until ${endReason}`,
            )

            break
        }
        case 'Respawn': {
            const { destructionTime, ETA } = fleetInfo.fleetState.data

            if (ETA.isBefore(now())) {
                logger.info(`Fleet: ${fleetInfo.fleetName} has respawned`)
            } else {
                logger.info(
                    `Fleet: ${fleetInfo.fleetName} respawning at ${fleetInfo.fleetState.data.sector}. ETA: ${dayjs.duration(ETA.diff(now())).humanize(false)}. Destruction time: ${destructionTime}`,
                )
            }
            break
        }
        default:
            logger.info(
                `Fleet: ${fleetInfo.fleetName} is ${fleetInfo.fleetState.type}`,
            )

            return Promise.resolve()
    }
}

export const createMiningStrategy = (
    miningConfig: MineConfig,
    p: Player,
): Strategy => {
    const config = miningConfig
    const player = p

    return {
        send: (fleetInfo: FleetInfo): Promise<void> =>
            transition(fleetInfo, player, config),
    }
}
