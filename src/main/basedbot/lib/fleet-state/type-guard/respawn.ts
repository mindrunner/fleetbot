import BN from 'bn.js'

import { RawRespawnData } from '../types'

export const isRespawnData = (data: unknown): data is RawRespawnData =>
    data !== undefined &&
    data instanceof Object &&
    'sector' in data &&
    Array.isArray(data.sector) &&
    data.sector.length === 2 &&
    data.sector[0] instanceof BN &&
    data.sector[1] instanceof BN
