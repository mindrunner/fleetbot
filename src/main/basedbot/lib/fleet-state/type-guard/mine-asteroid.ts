import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

import { RawMineAsteroidData } from '../types'

export const isMineAsteroidData = (
    data: unknown,
): data is RawMineAsteroidData =>
    data !== undefined &&
    data instanceof Object &&
    'asteroid' in data &&
    'resource' in data &&
    'start' in data &&
    'end' in data &&
    'amountMined' in data &&
    'lastUpdate' in data &&
    data.asteroid instanceof PublicKey &&
    data.resource instanceof PublicKey &&
    data.start instanceof BN &&
    data.end instanceof BN &&
    data.amountMined instanceof BN &&
    data.lastUpdate instanceof BN
