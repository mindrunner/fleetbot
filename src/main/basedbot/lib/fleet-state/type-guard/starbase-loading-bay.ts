import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

import { RawStarbaseLoadingBayData } from '../types'

export const isStarbaseLoadingBayData = (
    data: any,
): data is RawStarbaseLoadingBayData =>
    data && data.starbase instanceof PublicKey && data.lastUpdate instanceof BN
