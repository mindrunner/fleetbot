import BN from 'bn.js'

import { RawRespawnData } from '../types'

export const isRespawnData = (data: any): data is RawRespawnData =>
    data &&
    Array.isArray(data.sector) &&
    data.sector.length === 2 &&
    data.sector[0] instanceof BN &&
    data.sector[1] instanceof BN
