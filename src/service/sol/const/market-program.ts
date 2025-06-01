import { PublicKey } from '@solana/web3.js'

import { config } from '../../../config/index.js'

export const marketProgram = new PublicKey(config.sol.marketAddress)
