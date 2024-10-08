import { readAllFromRPC } from '@staratlas/data-source'
import { Fleet } from '@staratlas/sage'
import BN from 'bn.js'

import { connection } from '../../../../../service/sol'
import { getFleetState } from '../../fleet-state/fleet-state'
import { FleetState } from '../../fleet-state/types'
import { programs } from '../../programs'
import { Coordinates } from '../../util/coordinates'
import { getName } from '../util'

import { FleetCargo, getFleetCargoBalance } from './fleet-cargo'
import { Player } from './user-account'
import { WorldMap } from './world-map'

type ShipCounts = {
    total: number
    updated: number
    xxs: number
    xs: number
    s: number
    m: number
    l: number
    capital: number
    commander: number
    titan: number
}

type MovementStats = {
    subwarpSpeed: number
    warpSpeed: number
    maxWarpDistance: number
    warpCooldown: number
    subwarpFuelConsumptionRate: number
    warpFuelConsumptionRate: number
    planetExitFuelAmount: number
}

type CargoStats = {
    cargoCapacity: number
    fuelCapacity: number
    ammoCapacity: number
    ammoConsumptionRate: number
    foodConsumptionRate: number
    miningRate: number
    upgradeRate: number
}

type MiscStats = {
    crew: number
    respawnTime: number
    scanCooldown: number
    scanRepairKitAmount: number
}

export type FleetInfo = {
    fleet: Fleet
    location: Coordinates
    fleetName: string
    shipCounts: ShipCounts
    warpCooldownExpiresAt: BN
    scanCooldownExpiresAt: BN
    movementStats: MovementStats
    cargoStats: CargoStats
    miscStats: MiscStats
    fleetState: FleetState
    cargoLevels: FleetCargo
}

export const getUserFleets = async (player: Player): Promise<Array<Fleet>> => {
    const fleets = await readAllFromRPC(
        connection,
        programs.sage,
        Fleet,
        'processed',
        [
            {
                memcmp: {
                    offset: 8 + 1 + 32, // 8 (discriminator) + 1 (version) + 32 (gameId)
                    bytes: player.profile.key.toBase58(),
                },
            },
        ],
    )

    return fleets
        .filter((f) => f.type === 'ok' && 'data' in f)
        .map((f) => (f as any).data)
}

export const getFleetInfo = async (
    fleet: Fleet,
    player: Player,
    map: WorldMap,
): Promise<FleetInfo> => {
    const cargoLevels = await getFleetCargoBalance(fleet, player)
    const fleetState = await getFleetState(fleet, map, cargoLevels)
    const shipCounts = fleet.data.shipCounts as unknown as ShipCounts
    const movementStats = fleet.data.stats
        .movementStats as unknown as MovementStats
    const cargoStats = fleet.data.stats.cargoStats as unknown as CargoStats
    const miscStats = fleet.data.stats.miscStats as unknown as MiscStats
    const location = fleetState.data.sector
    const fleetName = getName(fleet)

    return {
        fleet,
        location,
        miscStats,
        movementStats,
        cargoStats,
        fleetName,
        shipCounts,
        fleetState,
        warpCooldownExpiresAt: fleet.data.warpCooldownExpiresAt,
        scanCooldownExpiresAt: fleet.data.scanCooldownExpiresAt,
        cargoLevels,
    }
}
