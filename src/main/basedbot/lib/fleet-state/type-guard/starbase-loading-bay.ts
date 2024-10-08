import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

import { RawStarbaseLoadingBayData } from '../types'

export const isStarbaseLoadingBayData = (
    data: unknown,
): data is RawStarbaseLoadingBayData =>
    data !== undefined &&
    data instanceof Object &&
    'starbase' in data &&
    'lastUpdate' in data &&
    data.starbase instanceof PublicKey &&
    data.lastUpdate instanceof BN
