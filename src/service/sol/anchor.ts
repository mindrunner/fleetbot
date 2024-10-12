// eslint-disable-next-line import/named
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'

import { keyPair } from '../wallet'

import { connection } from './const'

export const anchorProvider = new AnchorProvider(
    connection,
    new Wallet(keyPair),
    {},
)
