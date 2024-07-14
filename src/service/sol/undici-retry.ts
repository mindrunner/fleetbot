import {
    Agent,
    RequestInfo,
    RequestInit,
    Response,
    fetch,
    setGlobalDispatcher,
} from 'undici'

setGlobalDispatcher(new Agent({ connections: 100 }))

export const fetchWithRetries = async (
    input: URL | RequestInfo,
    init: RequestInit = {},
    retryAttempts = 0,
): Promise<Response> => {
    let attempt = 0

    init.headers ||= { 'Content-Type': 'application/json' }

    while (attempt < retryAttempts) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const response = await fetch(input, init)

            if (response.status === 502) {
                console.log('Retrying due to 502')
                attempt++
                // eslint-disable-next-line no-await-in-loop,promise/avoid-new,no-loop-func
                await new Promise<void>((resolve) => {
                    setTimeout(resolve, 100 * attempt)
                })
            } else {
                return response
            }
        } catch (e) {
            console.log(`Retrying due to error ${e}`, e)
            attempt++
        }
    }

    throw new Error('Max retries reached')
}
