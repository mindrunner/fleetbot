import { config } from '../../config/index.js'

export type RPCResult<T> = {
    ok: boolean
    code: number
    result: T
}

export type RpcRequestBody = any

export const rpcFetch = async <T>(
    body: RpcRequestBody,
): Promise<RPCResult<T>> => {
    const res = await fetch(config.sol.rpcEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    return {
        ok: res.ok,
        code: res.status,
        result: (await res.json()) as T,
    }
}
