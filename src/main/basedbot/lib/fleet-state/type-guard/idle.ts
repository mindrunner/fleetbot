import BN from 'bn.js'

import { RawIdleData } from '../types'

export const isIdleData = (data: unknown): data is RawIdleData =>
    data !== undefined &&
    data instanceof Object &&
    'sector' in data &&
    Array.isArray(data.sector) &&
    data.sector.length === 2 &&
    data.sector[0] instanceof BN &&
    data.sector[1] instanceof BN
