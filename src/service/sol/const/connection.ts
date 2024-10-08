import { Connection } from '@solana/web3.js'

import { config } from '../../../config'
import { fetchWithRetries } from '../undici-retry'

export const connection = new Connection(config.sol.rpcEndpoint, {
    wsEndpoint: config.sol.wsEndpoint,
    commitment: 'confirmed',
    fetch: (
        input: RequestInfo | URL,
        init?: RequestInit,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
    ): Promise<Response> => fetchWithRetries(input, init, 5),
})
