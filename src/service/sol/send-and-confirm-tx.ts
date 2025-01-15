import {
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js'

import { logger } from '../../logger'
import { keyPair } from '../wallet'

import { connection } from './const'
import { createComputeUnitInstruction } from './priority-fee/compute-unit-instruction'
import { createPriorityFeeInstruction } from './priority-fee/priority-fee-instruction'

// Constants for Solana transaction size limits
const MAX_TRANSACTION_SIZE = 1232 // Maximum size of a transaction in bytes
const TRANSACTION_HEADER_SIZE = 100 // Approximate size of transaction header, adjust if needed
const SIGNATURE_SIZE = 64 // Size of a signature in bytes

const sleep = (ms: number) =>
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
    let blockheight = await connection.getBlockHeight()

    let txId: string | undefined

    while (blockheight <= blockHash.lastValidBlockHeight) {
        blockheight = await connection.getBlockHeight()
        // logger.info(
        //     `${blockHash.lastValidBlockHeight} - ${blockheight} = ${blockHash.lastValidBlockHeight - blockheight}`,
        // )
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
        } catch (_e) {
            await sleep(500)
        }
    }

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

const getInstructionSize = (instructions: TransactionInstruction[]): number => {
    const messageV0 = new TransactionMessage({
        payerKey: keyPair.publicKey,
        recentBlockhash: PublicKey.default.toBase58(),
        instructions,
    }).compileToV0Message()

    // Serialize the message and return its length
    return new VersionedTransaction(messageV0).serialize().byteLength
    // return messageV0.serialize().length
}
const getOptimalInstructionChunk = (
    instructions: TransactionInstruction[],
    maxSize: number,
): TransactionInstruction[] => {
    for (let i = 0; i < instructions.length; ++i) {
        const instructionSize = getInstructionSize(instructions.slice(0, i + 1))

        logger.debug(
            `Transaction with ${i + 1} instructions has size ${instructionSize}`,
        )

        if (instructionSize > maxSize) {
            return instructions.slice(0, i)
        }
    }

    return instructions
}

export const sendAndConfirmInstructions = async (
    instructionArray: TransactionInstruction[],
): Promise<string[]> => {
    const maxRetries = 10
    let instructions = instructionArray
    const results: string[] = []

    while (instructions.length > 0) {
        const availableSize =
            MAX_TRANSACTION_SIZE - TRANSACTION_HEADER_SIZE - SIGNATURE_SIZE

        const chunk = getOptimalInstructionChunk(instructions, availableSize)

        for (let i = 0; i < maxRetries; ++i) {
            const [
                latestBlockHash,
                priorityFeeInstruction,
                computeUnitsInstruction,
            ] = await Promise.all([
                connection.getLatestBlockhash(),
                createPriorityFeeInstruction(chunk),
                createComputeUnitInstruction(chunk),
            ])

            const txInstructions = [
                computeUnitsInstruction,
                priorityFeeInstruction,
                ...chunk,
            ]

            const transaction = createAndSignTransaction(
                txInstructions,
                latestBlockHash.blockhash,
            )

            const rawTransaction = transaction.serialize()

            if (rawTransaction.length > MAX_TRANSACTION_SIZE) {
                throw new Error(
                    `Transaction too large: ${rawTransaction.length} bytes`,
                )
            }

            try {
                logger.debug(
                    Buffer.from(transaction.serialize()).toString('base64'),
                )
                const result = await sendAndConfirmTx(
                    transaction,
                    latestBlockHash,
                )

                results.push(result)
                instructions = instructions.slice(chunk.length)
                break // Exit retry loop if successful
            } catch (e) {
                const message = (e as any).message as string

                logger.error(
                    `Transaction failed: ${message}, retrying... (${i + 1}/${maxRetries})`,
                )

                if (i === maxRetries - 1) {
                    throw new Error(
                        `Transaction failed after ${maxRetries} attempts`,
                    )
                }
            }
        }
    }

    return results
}
