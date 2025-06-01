import { PublicKey } from '@solana/web3.js'
import { MineItem, Starbase } from '@staratlas/sage'
import BN from 'bn.js'

import dayjs from '../../../../dayjs.js'
import { Coordinates } from '../util/coordinates.js'

export type EndReason = 'FULL' | 'AMMO' | 'FOOD'
type BaseData = {
    sector: Coordinates
    warpCooldownExpiry: dayjs.Dayjs
    scanCoolDownExpiry: dayjs.Dayjs
    warpCooldown: boolean
    scanCooldown: boolean
}

// Raw data types for incoming data
export type RawIdleData = {
    sector: [BN, BN]
}

export type IdleData = BaseData

export type RawStarbaseLoadingBayData = { starbase: PublicKey; lastUpdate: BN }
export type StarbaseLoadingBayData = {
    starbase: Starbase
    lastUpdate: BN
} & BaseData

export type RawMineAsteroidData = {
    asteroid: PublicKey
    resource: PublicKey
    start: BN
    end: BN
    amountMined: BN
    lastUpdate: BN
    sector: BN[]
}
export type MineAsteroidData = {
    asteroid: PublicKey
    mineItem: MineItem
    resource: PublicKey
    start: dayjs.Dayjs
    end: dayjs.Dayjs
    amountMined: BN
    lastUpdate: dayjs.Dayjs
    endReason: EndReason
} & BaseData

export type RawMoveWarpData = {
    fromSector: BN[]
    toSector: BN[]
    warpStart: BN
    warpFinish: BN
}
export type MoveWarpData = {
    fromSector: Coordinates
    toSector: Coordinates
    warpStart: dayjs.Dayjs
    warpFinish: dayjs.Dayjs
} & BaseData

export type RawMoveSubwarpData = {
    fromSector: BN[]
    toSector: BN[]
    currentSector: BN[]
    departureTime: BN
    arrivalTime: BN
    fuelExpenditure: BN
    lastUpdate: BN
}
export type MoveSubwarpData = {
    fromSector: Coordinates
    toSector: Coordinates
    departureTime: dayjs.Dayjs
    arrivalTime: dayjs.Dayjs
    fuelExpenditure: BN
    lastUpdate: dayjs.Dayjs
} & BaseData

export type RawRespawnData = {
    sector: [BN, BN]
    start: BN
}
export type RespawnData = {
    destructionTime: dayjs.Dayjs
    ETA: dayjs.Dayjs
} & BaseData
export type StarbaseUpgradeData = BaseData
export type StarbaseRepairData = BaseData

export type FleetStateType =
    | 'StarbaseLoadingBay'
    | 'Idle'
    | 'MineAsteroid'
    | 'MoveWarp'
    | 'MoveSubwarp'
    | 'Respawn'
    | 'StarbaseUpgrade'
    | 'StarbaseRepair'

export type FleetStateDataMap = {
    StarbaseLoadingBay: StarbaseLoadingBayData
    Idle: IdleData
    MineAsteroid: MineAsteroidData
    MoveWarp: MoveWarpData
    MoveSubwarp: MoveSubwarpData
    Respawn: RespawnData
    StarbaseUpgrade: StarbaseUpgradeData
    StarbaseRepair: StarbaseRepairData
}

export type FleetState = {
    [K in FleetStateType]: {
        type: K
        data: FleetStateDataMap[K]
    }
}[FleetStateType]
