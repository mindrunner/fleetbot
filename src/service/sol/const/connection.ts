import { Connection } from '@solana/web3.js'

import { config } from '../../../config'

export const connection = new Connection(config.sol.rpcEndpoint, { wsEndpoint: config.sol.wsEndpoint })
