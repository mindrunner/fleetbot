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

export const airdropCrew = async (
    baseUrl: string,
    token: string,
    address: PublicKey,
    amount: number,
) => {
    logger.info(`Airdropping Crew to: ${address.toBase58()}`)

    const res = await superagent.get(`${baseUrl}/airdrop/crew`).query({
        token,
        address: address.toBase58(),
        amount,
    })

    logger.info(`Airdropped Crew to ${address.toBase58()}: ${res.statusCode}`)
}

export const airdropSol = async (
    baseUrl: string,
    token: string,
    address: PublicKey,
    amount: number,
) => {
    logger.info(`Airdropping SOL to: ${address.toBase58()}`)

    const res = await superagent.get(`${baseUrl}/airdrop/sol`).query({
        token,
        address: address.toBase58(),
        amount,
    })

    logger.info(`Airdropped SOL to ${address.toBase58()}: ${res.statusCode}`)
}
