import { Connection } from '@solana/web3.js'
import { config } from '../../../config/index.js'
import { fetchWithRetries } from '../undici-retry.js'

export const connection = new Connection(config.sol.rpcEndpoint, {
    wsEndpoint: config.sol.wsEndpoint,
    commitment: 'confirmed',
    fetch: (
        input: RequestInfo | URL,
        init?: RequestInit,
    ): Promise<Response> => {
        return fetchWithRetries(input, init, 5)
    },
})
