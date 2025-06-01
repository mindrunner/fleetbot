import { AnchorProvider, Wallet } from '@coral-xyz/anchor'

import { keyPair } from '../wallet/index.js'

import { connection } from './const/index.js'

export const anchorProvider = new AnchorProvider(
    connection,
    new Wallet(keyPair),
    {},
)
