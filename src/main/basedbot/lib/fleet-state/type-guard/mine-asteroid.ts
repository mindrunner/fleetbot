import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

import { RawMineAsteroidData } from '../types'

export const isMineAsteroidData = (data: any): data is RawMineAsteroidData =>
    data &&
    data.asteroid instanceof PublicKey &&
    data.resource instanceof PublicKey &&
    data.start instanceof BN &&
    data.end instanceof BN &&
    data.amountMined instanceof BN &&
    data.lastUpdate instanceof BN
