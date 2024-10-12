import BN from 'bn.js'

import { RawMoveSubwarpData } from '../types'

// TODO: Add all the fields that are required to be present in the data
export const isMoveSubWarpData = (data: unknown): data is RawMoveSubwarpData =>
    data !== undefined &&
    data instanceof Object &&
    'fromSector' in data &&
    'toSector' in data &&
    Array.isArray(data.fromSector) &&
    data.fromSector.length === 2 &&
    data.fromSector[0] instanceof BN &&
    data.fromSector[1] instanceof BN &&
    Array.isArray(data.toSector) &&
    data.toSector.length === 2 &&
    data.toSector[0] instanceof BN &&
    data.toSector[1] instanceof BN
