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
        maxWarpDistance,
    } = fleetInfo.movementStats

    const subwarpFuelRate = subwarpFuelConsumptionRate / 10000
    const warpFuelRate = warpFuelConsumptionRate / 10000

    const subwarp = distance * subwarpFuelRate
    const warp = distance * warpFuelRate

    const res: FuelConsumption = {
        auto: distance <= maxWarpDistance ? warp : subwarp,
        subwarp,
        warp,
    }

    return res
}
