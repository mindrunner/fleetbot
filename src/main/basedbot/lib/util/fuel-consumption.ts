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
        maxWarpDistance,
    } = fleetInfo.movementStats

    const warpTime = distance / warpSpeed
    const subwarpTime = distance / subwarpSpeed

    const warp = warpTime * (warpFuelConsumptionRate / 100)
    const subwarp = subwarpTime * (subwarpFuelConsumptionRate / 100)

    return {
        auto: distance <= maxWarpDistance ? warp : subwarp,
        subwarp,
        warp,
    }
}
