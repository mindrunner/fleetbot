import {
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js'

import { logger } from '../../logger'
import { keyPair } from '../wallet'

import { connection } from './const'
import { createComputeUnitInstruction } from './priority-fee/compute-unit-instruction'
import { createPriorityFeeInstruction } from './priority-fee/priority-fee-instruction'

const sleep = (ms: number) =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })

type Blockhash = string
type BlockhashWithExpiryBlockHeight = Readonly<{
    blockhash: Blockhash
    lastValidBlockHeight: number
}>

const confirmTx = async (txId: string): Promise<string | undefined> => {
    const res = await connection.getSignatureStatus(txId)

    // logger.debug(`Signature: ${txId} with status: ${JSON.stringify(res)}`)

    if (res?.value && 'confirmationStatus' in res.value) {
        if (
            res.value.confirmationStatus === 'finalized' ||
            res.value.confirmationStatus === 'confirmed' ||
            res.value.confirmationStatus === 'processed'
        ) {
            const log = res.value.err ? logger.warn : logger.info

            // log(`Transaction ${res.value.confirmationStatus}: ${txId} with status: ${res.value.confirmationStatus}`)
            log(`Signature: ${txId} with status: ${JSON.stringify(res)}`)

            // logger.info(`https://solscan.io/tx/${txId}`)

            return txId
        }
    }
    throw new Error('Transaction confirmation failed')
}

export const sendAndConfirmTx = async (
    transaction: VersionedTransaction,
    latestBlockHash?: BlockhashWithExpiryBlockHeight,
): Promise<string> => {
    const blockHash = latestBlockHash ?? (await connection.getLatestBlockhash())
    const blockheight = await connection.getBlockHeight()

    let txId: string | undefined

    /* eslint-disable no-await-in-loop */
    while (blockheight <= blockHash.lastValidBlockHeight) {
        try {
            txId = await connection.sendRawTransaction(
                transaction.serialize(),
                { skipPreflight: true },
            )
        } catch (e) {
            const message = (e as any).message as string

            const logs = (e as any).logs as string[]

            logs.filter((log) => log.includes('AnchorError')).forEach((log) => {
                logger.error(log)
            })

            if (message.includes('has already been processed') && txId) {
                await confirmTx(txId)

                return txId
            }
            throw e
        }

        try {
            await confirmTx(txId)

            return txId
        } catch (e) {
            await sleep(500)
        }
    }
    /* eslint-enable no-await-in-loop */

    throw new Error(`Transaction ${txId} failed to confirm`)
}

const createAndSignTransaction = (
    instructions: TransactionInstruction[],
    blockhash: Blockhash,
): VersionedTransaction => {
    const messageV0 = new TransactionMessage({
        payerKey: keyPair.publicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message()
    const transaction = new VersionedTransaction(messageV0)

    transaction.sign([keyPair, keyPair])

    return transaction
}

export const sendAndConfirmInstructions = async (
    instructions: TransactionInstruction[],
): Promise<string> => {
    const maxRetries = 10

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < maxRetries; ++i) {
        const [
            latestBlockHash,
            priorityFeeInstruction,
            computeUnitsInstruction,
        ] = await Promise.all([
            connection.getLatestBlockhash(),
            createPriorityFeeInstruction(),
            createComputeUnitInstruction(instructions),
        ])

        const txInstructions = [
            computeUnitsInstruction,
            priorityFeeInstruction,
            ...instructions,
        ]

        const transaction = createAndSignTransaction(
            txInstructions,
            latestBlockHash.blockhash,
        )

        try {
            return await sendAndConfirmTx(transaction, latestBlockHash)
        } catch (e) {
            const message = (e as any).message as string

            logger.error(
                `Transaction failed: ${message}, retrying... (${i + 1}/${maxRetries})`,
            )
        }
    }
    /* eslint-enable no-await-in-loop */
    throw new Error(`Transaction failed after ${maxRetries} attempts`)
}
