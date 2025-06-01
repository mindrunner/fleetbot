import { Agent, setGlobalDispatcher } from 'undici'

setGlobalDispatcher(new Agent({ connections: 100, connectTimeout: 30000 }))

export const fetchWithRetries = async (
    input: RequestInfo | URL,
    init: RequestInit = {},
    retryAttempts: number = 3,
    retryDelayMs: number = 100,
): Promise<Response> => {
    let attempt = 0

    init.headers = {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
    }

    while (true) {
        try {
            const response = await fetch(input, init)

            if (response.status === 502 && attempt < retryAttempts) {
                console.log(
                    `Retrying due to status 502 (attempt ${attempt + 1}/${retryAttempts})`,
                )
            } else {
                return response
            }
        } catch (e) {
            if (attempt >= retryAttempts) {
                throw new Error(`Max retries reached due to error: ${e}`)
            }
            console.log(
                `Retrying due to error (${attempt + 1}/${retryAttempts}): ${e}`,
            )
        }

        attempt++
        await new Promise((resolve) =>
            setTimeout(resolve, retryDelayMs * attempt),
        )
    }
}
