import { PublicKey } from '@solana/web3.js'

import { config } from '../../../config/index.js'

export const fleetProgram = new PublicKey(config.sol.fleetAddress)
