import { ScoreVarsShipInfo, ShipStakingInfo } from '@staratlas/factory'

export interface ResourceStats {
    food: Stats
    tool: Stats
    fuel: Stats
    ammo: Stats
}

export interface Stats {
    unitsBurnt: number
    unitsLeftPct: number
    unitsLeft: number
    secondsLeft: number
    totalSeconds: number
    maxSeconds: number
    maxUnits: number
    burnRatePerShip: number
    burnRatePerFleet: number
}

export const getTimePass = (fleet: ShipStakingInfo): number => {
    const now = Date.now() / 1000
    const tripStart = fleet.currentCapacityTimestamp.toNumber()

    return now - tripStart
}
export const getRemainFoodSec = (
    fleet: ShipStakingInfo,
    tp: number | undefined = undefined,
): number => {
    const timePass = tp === undefined ? getTimePass(fleet) : tp

    return fleet.foodCurrentCapacity.toNumber() - timePass
}

export const getRemainArmsSec = (
    fleet: ShipStakingInfo,
    tp: number | undefined = undefined,
): number => {
    const timePass = tp === undefined ? getTimePass(fleet) : tp

    return fleet.armsCurrentCapacity.toNumber() - timePass
}

export const getRemainFuelSec = (
    fleet: ShipStakingInfo,
    tp: number | undefined = undefined,
): number => {
    const timePass = tp === undefined ? getTimePass(fleet) : tp

    return fleet.fuelCurrentCapacity.toNumber() - timePass
}

export const getRemainHealthSec = (
    fleet: ShipStakingInfo,
    tp: number | undefined = undefined,
): number => {
    const timePass = tp === undefined ? getTimePass(fleet) : tp

    return fleet.healthCurrentCapacity.toNumber() - timePass
}

export const timePassSinceLastAction = (fleet: ShipStakingInfo): number => {
    let timePassSinceStart = getTimePass(fleet)

    const [foodRemainSec, armsRemainSec, fuelRemainSec, healthRemainSec] = [
        getRemainFoodSec(fleet),
        getRemainArmsSec(fleet),
        getRemainFuelSec(fleet),
        getRemainHealthSec(fleet),
    ]

    const depletionTime = Math.min(
        foodRemainSec,
        armsRemainSec,
        fuelRemainSec,
        healthRemainSec,
    )

    if (depletionTime < 0) {
        timePassSinceStart = depletionTime + timePassSinceStart
    }

    return timePassSinceStart
}

export const getRemainFoodDetails = (
    shipInfo: ScoreVarsShipInfo,
    fleet: ShipStakingInfo,
    timePassSinceStart: number,
): Stats => {
    const secondsLeft = getRemainFoodSec(fleet, timePassSinceStart)
    const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneFood / 1000) // Per Second
    const burnRatePerFleet =
        1 /
        (shipInfo.millisecondsToBurnOneFood /
            fleet.shipQuantityInEscrow.toNumber() /
            1000)
    const unitsBurnt =
        unitsBurnRate *
        timePassSinceStart *
        fleet.shipQuantityInEscrow.toNumber()
    const unitsLeft =
        unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber()
    const unitsLeftPct =
        unitsLeft /
        (shipInfo.foodMaxReserve * fleet.shipQuantityInEscrow.toNumber())
    const totalSeconds = fleet.foodCurrentCapacity.toNumber()
    const maxSeconds =
        shipInfo.foodMaxReserve *
        fleet.shipQuantityInEscrow.toNumber() *
        (shipInfo.millisecondsToBurnOneFood /
            1000 /
            fleet.shipQuantityInEscrow.toNumber())
    const maxUnits =
        shipInfo.foodMaxReserve * fleet.shipQuantityInEscrow.toNumber()

    return {
        unitsBurnt,
        unitsLeftPct,
        unitsLeft,
        secondsLeft: Math.max(0, secondsLeft),
        totalSeconds,
        maxSeconds,
        maxUnits,
        burnRatePerShip: unitsBurnRate,
        burnRatePerFleet,
    }
}

export const getRemainArmsDetails = (
    shipInfo: ScoreVarsShipInfo,
    fleet: ShipStakingInfo,
    timePassSinceStart: number,
): Stats => {
    const secondsLeft = getRemainArmsSec(fleet, timePassSinceStart)
    const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneArms / 1000) // Per Second
    const unitsBurnt =
        unitsBurnRate *
        timePassSinceStart *
        fleet.shipQuantityInEscrow.toNumber()
    const burnRatePerFleet =
        1 /
        (shipInfo.millisecondsToBurnOneArms /
            1000 /
            fleet.shipQuantityInEscrow.toNumber())
    const unitsLeft =
        unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber()
    const unitsLeftPct =
        unitsLeft /
        (shipInfo.armsMaxReserve * fleet.shipQuantityInEscrow.toNumber())
    const maxSeconds =
        shipInfo.armsMaxReserve *
        fleet.shipQuantityInEscrow.toNumber() *
        (shipInfo.millisecondsToBurnOneArms /
            1000 /
            fleet.shipQuantityInEscrow.toNumber())
    const totalSeconds = fleet.armsCurrentCapacity.toNumber()
    const maxUnits =
        shipInfo.armsMaxReserve * fleet.shipQuantityInEscrow.toNumber()

    return {
        unitsBurnt,
        unitsLeftPct,
        unitsLeft,
        secondsLeft: Math.max(0, secondsLeft),
        totalSeconds,
        maxSeconds,
        maxUnits,
        burnRatePerShip: unitsBurnRate,
        burnRatePerFleet,
    }
}

export const getRemainFuelDetails = (
    shipInfo: ScoreVarsShipInfo,
    fleet: ShipStakingInfo,
    timePassSinceStart: number,
): Stats => {
    const secondsLeft = getRemainFuelSec(fleet, timePassSinceStart)
    const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneFuel / 1000) // Per Second
    const unitsBurnt =
        unitsBurnRate *
        timePassSinceStart *
        fleet.shipQuantityInEscrow.toNumber()
    const burnRatePerFleet =
        1 /
        (shipInfo.millisecondsToBurnOneFuel /
            fleet.shipQuantityInEscrow.toNumber() /
            1000)
    const unitsLeft =
        unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber()
    const unitsLeftPct =
        unitsLeft /
        (shipInfo.fuelMaxReserve * fleet.shipQuantityInEscrow.toNumber())
    const totalSeconds = fleet.fuelCurrentCapacity.toNumber()
    const maxSeconds =
        shipInfo.fuelMaxReserve *
        fleet.shipQuantityInEscrow.toNumber() *
        (shipInfo.millisecondsToBurnOneFuel /
            1000 /
            fleet.shipQuantityInEscrow.toNumber())
    const maxUnits =
        shipInfo.fuelMaxReserve * fleet.shipQuantityInEscrow.toNumber()

    return {
        unitsBurnt,
        unitsLeftPct,
        unitsLeft,
        secondsLeft: Math.max(0, secondsLeft),
        totalSeconds,
        maxSeconds,
        maxUnits,
        burnRatePerShip: unitsBurnRate,
        burnRatePerFleet,
    }
}

export const getRemainHealthDetails = (
    shipInfo: ScoreVarsShipInfo,
    fleet: ShipStakingInfo,
    timePassSinceStart: number,
): Stats => {
    const unitsLeftPct =
        (fleet.healthCurrentCapacity.toNumber() - timePassSinceStart) /
        fleet.healthCurrentCapacity.toNumber()
    const secondsLeft = getRemainHealthSec(fleet, timePassSinceStart)
    const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneToolkit / 1000)
    const burnRatePerFleet =
        1 /
        (shipInfo.millisecondsToBurnOneToolkit /
            fleet.shipQuantityInEscrow.toNumber() /
            1000)
    const unitsLeft =
        secondsLeft /
        (shipInfo.millisecondsToBurnOneToolkit /
            1000 /
            fleet.shipQuantityInEscrow.toNumber())
    const totalSeconds = fleet.healthCurrentCapacity.toNumber()
    const maxSeconds =
        shipInfo.toolkitMaxReserve *
        fleet.shipQuantityInEscrow.toNumber() *
        (shipInfo.millisecondsToBurnOneToolkit /
            1000 /
            fleet.shipQuantityInEscrow.toNumber())
    const maxUnits =
        shipInfo.toolkitMaxReserve * fleet.shipQuantityInEscrow.toNumber()

    return {
        unitsBurnt: 0,
        unitsLeftPct,
        secondsLeft: Math.max(0, secondsLeft),
        totalSeconds,
        maxSeconds,
        maxUnits,
        unitsLeft,
        burnRatePerShip: unitsBurnRate,
        burnRatePerFleet,
    }
}

export const getFleetRemainingResources = (
    shipInfo: ScoreVarsShipInfo,
    fleet: ShipStakingInfo,
): ResourceStats => {
    const timePassSinceStart = timePassSinceLastAction(fleet)

    return {
        food: getRemainFoodDetails(shipInfo, fleet, timePassSinceStart),
        ammo: getRemainArmsDetails(shipInfo, fleet, timePassSinceStart),
        fuel: getRemainFuelDetails(shipInfo, fleet, timePassSinceStart),
        tool: getRemainHealthDetails(shipInfo, fleet, timePassSinceStart),
    }
}
