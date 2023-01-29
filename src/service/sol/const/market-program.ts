import { PublicKey } from '@solana/web3.js'

import { config } from '../../../config'

export const marketProgram = new PublicKey(config.sol.marketAddress)
