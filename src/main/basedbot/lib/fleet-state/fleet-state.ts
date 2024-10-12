import { CargoStats, Fleet, MiscStats } from '@staratlas/sage'
import Big from 'big.js'
import BN from 'bn.js'

import { now } from '../../../../dayjs'
import { FleetCargo } from '../sage/state/fleet-cargo'
import { planetByKey } from '../sage/state/planet-by-key'
import { starbaseByKey } from '../sage/state/starbase-by-key'
import { WorldMap } from '../sage/state/world-map'
import { Coordinates } from '../util/coordinates'

import { transformSector } from './transform/transform-sector'
import { transformTime } from './transform/transform-time'
import { isIdleData } from './type-guard/idle'
import { isMineAsteroidData } from './type-guard/mine-asteroid'
import { isMoveSubWarpData } from './type-guard/move-sub-warp'
import { isMoveWarpData } from './type-guard/move-warp'
import { isRespawnData } from './type-guard/respawn'
import { isStarbaseLoadingBayData } from './type-guard/starbase-loading-bay'
import {
    EndReason,
    FleetState,
    FleetStateType,
    RawMineAsteroidData,
} from './types'

const toBig = (bn: BN): Big => new Big(bn.toString())
const toBN = (bigInt: Big): BN => new BN(bigInt.toString())

const calculateCurrentPosition = (
    startPos: Coordinates,
    destPos: Coordinates,
    startTime: BN,
    endTime: BN,
    currentTime: BN,
): Coordinates => {
    if (currentTime.gte(endTime)) {
        return destPos
    } else if (currentTime.lte(startTime)) {
        return startPos
    }

    const totalTime = toBig(endTime.sub(startTime))
    const elapsedTime = toBig(currentTime.sub(startTime))
    const ratio = elapsedTime.div(totalTime)

    const xDifference = toBig(destPos.xBN.sub(startPos.xBN))
    const yDifference = toBig(destPos.yBN.sub(startPos.yBN))

    const xt = toBig(startPos.xBN).add(xDifference.mul(ratio))
    const yt = toBig(startPos.yBN).add(yDifference.mul(ratio))

    return Coordinates.fromBN(toBN(xt.round(0, 1)), toBN(yt.round(0, 1)))
}

type MiningStats = {
    startTime: BN
    endTime: BN
    cargoLevel: number
    miningRate: number
    amountMined: number
    ammoRequired: number
    foodRequired: number
    ammoConsumptionRate: number
    foodConsumptionRate: number
    ammoLevel: number
    foodLevel: number
    endReason: EndReason
    maxMiningDuration: number
    isMining: boolean
}

const getMiningStats = (
    fleet: Fleet,
    cargoLevels: FleetCargo,
    mineAsteroidData: RawMineAsteroidData,
): MiningStats => {
    const cargoStats = fleet.data.stats.cargoStats as unknown as CargoStats
    const {
        miningRate,
        cargoCapacity,
        foodConsumptionRate,
        ammoConsumptionRate,
    } = cargoStats

    const startTime = mineAsteroidData.start

    let cargoLevel = 0

    for (const [_, value] of cargoLevels.cargo) {
        cargoLevel += value
    }

    const cargoSpace = cargoCapacity - cargoLevel

    const miningRatePerSecond = miningRate / 10000
    const ammoConsumptionRatePerSecond = ammoConsumptionRate / 10000
    const foodConsumptionRatePerSecond = foodConsumptionRate / 10000

    const durationToFull = cargoSpace / miningRatePerSecond
    const durationToammoDepletion =
        cargoLevels.ammo / ammoConsumptionRatePerSecond
    const durationToFoodDepletion =
        cargoLevels.food / foodConsumptionRatePerSecond

    const maxMiningDuration = Math.min(
        durationToFull,
        durationToammoDepletion,
        durationToFoodDepletion,
    )

    const endReason =
        maxMiningDuration === durationToFull
            ? 'FULL'
            : maxMiningDuration === durationToammoDepletion
              ? 'AMMO'
              : 'FOOD'

    const n = new BN(now().unix())
    const miningDuration = n.sub(startTime).toNumber()

    const realMiningDuration = Math.min(miningDuration, maxMiningDuration)

    const amountMined = miningRatePerSecond * realMiningDuration
    const ammoConsumed = ammoConsumptionRatePerSecond * realMiningDuration
    const foodConsumed = foodConsumptionRatePerSecond * realMiningDuration

    return {
        startTime,
        endTime: startTime.add(new BN(maxMiningDuration)),
        cargoLevel,
        miningRate,
        amountMined,
        ammoRequired: ammoConsumed,
        foodRequired: foodConsumed,
        ammoConsumptionRate,
        foodConsumptionRate,
        ammoLevel: cargoLevels.ammo - ammoConsumed,
        foodLevel: cargoLevels.food - foodConsumed,
        endReason,
        maxMiningDuration,
        isMining: miningDuration < maxMiningDuration,
    }
}

export const getFleetState = async (
    fleet: Fleet,
    map: WorldMap,
    cargoLevels: FleetCargo,
): Promise<FleetState> => {
    const fleetStateKeys = Object.keys(fleet.state) as Array<FleetStateType>
    const miscStats = fleet.data.stats.miscStats as unknown as MiscStats

    if (fleetStateKeys.length === 0) {
        throw new Error('Fleet state is empty')
    }

    const [type] = fleetStateKeys
    const data = fleet.state[type as keyof typeof fleet.state]

    if (!data) {
        throw new Error('Data is empty')
    }
    const warpCooldownExpiry = transformTime(fleet.data.warpCooldownExpiresAt)
    const scanCoolDownExpiry = transformTime(fleet.data.scanCooldownExpiresAt)

    const baseData = {
        warpCooldownExpiry,
        scanCoolDownExpiry,
        warpCooldown: warpCooldownExpiry.isAfter(now()),
        scanCooldown: scanCoolDownExpiry.isAfter(now()),
    }

    switch (type) {
        case 'Idle':
            if (isIdleData(data)) {
                return {
                    type,
                    data: {
                        sector: transformSector(data.sector),
                        ...baseData,
                    },
                }
            }
            break
        case 'StarbaseLoadingBay':
            if (isStarbaseLoadingBayData(data)) {
                const starbase = await starbaseByKey(data.starbase)

                return {
                    type,
                    data: {
                        starbase,
                        lastUpdate: data.lastUpdate,
                        sector: transformSector(starbase.data.sector),
                        ...baseData,
                    },
                }
            }
            break
        case 'MineAsteroid':
            if (isMineAsteroidData(data)) {
                const planet = await planetByKey(data.asteroid)

                const miningStats = getMiningStats(fleet, cargoLevels, data)

                return {
                    type,
                    data: {
                        sector: transformSector(planet.data.sector),
                        lastUpdate: transformTime(data.lastUpdate),
                        amountMined: new BN(miningStats.amountMined),
                        asteroid: data.asteroid,
                        end: transformTime(miningStats.endTime),
                        resource: data.resource,
                        mineItem: map.mineItems.get(data.resource.toBase58())!,
                        start: transformTime(data.start),
                        endReason: miningStats.endReason,
                        ...baseData,
                    },
                }
            }
            break
        case 'MoveWarp':
            if (isMoveWarpData(data)) {
                return {
                    type,
                    data: {
                        fromSector: transformSector(data.fromSector),
                        toSector: transformSector(data.toSector),
                        warpStart: transformTime(data.warpStart),
                        warpFinish: transformTime(data.warpFinish),
                        sector: calculateCurrentPosition(
                            transformSector(data.fromSector),
                            transformSector(data.toSector),
                            data.warpStart,
                            data.warpFinish,
                            new BN(now().unix()),
                        ),
                        ...baseData,
                    },
                }
            }
            break
        case 'MoveSubwarp':
            if (isMoveSubWarpData(data)) {
                return {
                    type,
                    data: {
                        fromSector: transformSector(data.fromSector),
                        toSector: transformSector(data.toSector),
                        departureTime: transformTime(data.departureTime),
                        arrivalTime: transformTime(data.arrivalTime),
                        fuelExpenditure: data.fuelExpenditure,
                        lastUpdate: transformTime(data.lastUpdate),
                        sector: calculateCurrentPosition(
                            transformSector(data.fromSector),
                            transformSector(data.toSector),
                            data.departureTime,
                            data.arrivalTime,
                            new BN(now().unix()),
                        ),
                        ...baseData,
                    },
                }
            }
            break
        case 'Respawn':
            if (isRespawnData(data)) {
                return {
                    type,
                    data: {
                        sector: transformSector(data.sector),
                        destructionTime: transformTime(data.start),
                        ETA: transformTime(
                            data.start.add(new BN(miscStats.respawnTime)),
                        ),
                        ...baseData,
                    },
                }
            }
            break
    }

    throw new Error('Data does not match expected type for the fleet state')
}
