import { Connection } from '@solana/web3.js'

import { config } from '../../../config'
import { fetchWithRetries } from '../undici-retry'

export const connection = new Connection(config.sol.rpcEndpoint, {
    wsEndpoint: config.sol.wsEndpoint,
    commitment: 'confirmed',
    fetch: (
        input: RequestInfo | URL,
        init?: RequestInit,

        // @ts-expect-error
    ): Promise<Response> => fetchWithRetries(input, init, 5),
})
