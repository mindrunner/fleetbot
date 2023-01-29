import { PublicKey } from '@solana/web3.js'

import { config } from '../../../config'

export const fleetProgram = new PublicKey(config.sol.fleetAddress)
