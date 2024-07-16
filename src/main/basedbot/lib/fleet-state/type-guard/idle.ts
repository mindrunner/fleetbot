import BN from 'bn.js'

import { RawIdleData } from '../types'

export const isIdleData = (data: any): data is RawIdleData =>
    data &&
    Array.isArray(data.sector) &&
    data.sector.length === 2 &&
    data.sector[0] instanceof BN &&
    data.sector[1] instanceof BN
