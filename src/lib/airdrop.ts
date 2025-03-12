import { PublicKey } from '@solana/web3.js'
import superagent from 'superagent'
import { logger } from '../logger'

export const airdrop = async (
    baseUrl: string,
    token: string,
    address: PublicKey,
) => {
    logger.info(`Airdropping to: ${address.toBase58()}`)

    const res = await superagent.get(`${baseUrl}/airdrop/sage`).query({
        token,
        address: address.toBase58(),
    })

    logger.info(`Airdropped to ${address.toBase58()}: ${res.statusCode}`)
}
