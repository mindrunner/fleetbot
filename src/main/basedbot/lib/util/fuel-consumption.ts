import { FleetInfo } from '../sage/state/user-fleets'
import { Coordinates } from './coordinates'

export type FuelConsumption = {
    auto: number
    warp: number
    subwarp: number
}

export const getFuelConsumption = (
    from: Coordinates,
    to: Coordinates,
    fleetInfo: FleetInfo,
): FuelConsumption => {
    const distance = from.distanceFrom(to) * 100
    const {
        subwarpFuelConsumptionRate,
        warpFuelConsumptionRate,
        subwarpSpeed,
        warpSpeed,
    } = fleetInfo.movementStats

    const warpDistancePerSecond = warpSpeed / 1000000
    const subwarpDistancePerSecond = subwarpSpeed / 1000000

    const subWarpFuelConsumptionRatePerSecond = subwarpFuelConsumptionRate / 100
    const warpFuelConsumptionRatePerSecond = warpFuelConsumptionRate / 100

    const { maxWarpDistance } = fleetInfo.movementStats
    const canWarp = distance <= maxWarpDistance

    const subwarp =
        distance *
        subwarpDistancePerSecond *
        subWarpFuelConsumptionRatePerSecond
    const warp =
        distance * warpDistancePerSecond * warpFuelConsumptionRatePerSecond

    return {
        auto: canWarp ? warp : subwarp,
        subwarp,
        warp,
    }
}
