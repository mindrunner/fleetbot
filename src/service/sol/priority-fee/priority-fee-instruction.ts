import {
    AddressLookupTableAccount,
    ComputeBudgetProgram,
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js'
import base58 from 'bs58'

import { logger } from '../../../logger'
import { keyPair } from '../../wallet'
import { rpcFetch } from '../rpc-fetch'

const getDummyTransaction = (
    instructions: TransactionInstruction[],
    payer: PublicKey,
    lookupTables: AddressLookupTableAccount[],
): VersionedTransaction => {
    const testInstructions = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        ...instructions,
    ]

    return new VersionedTransaction(
        new TransactionMessage({
            instructions: testInstructions,
            payerKey: payer,
            recentBlockhash: PublicKey.default.toString(),
        }).compileToV0Message(lookupTables),
    )
}

export const createPriorityFeeInstruction = async (
    instructions: TransactionInstruction[],
): Promise<TransactionInstruction> => {
    const transaction = getDummyTransaction(instructions, keyPair.publicKey, [])

    const result = await rpcFetch({
        jsonrpc: '2.0',
        id: 1,
        method: 'getRecentPrioritizationFees',
        params: {
            transaction: base58.encode(transaction.serialize()),
            percentiles: [50, 75, 95, 100],
            lookbackSlots: 10,
        },
    })

    const feeData = (result as any).result as Array<{
        slot: number
        prioritizationFee: number
    }>

    const microLamports =
        feeData.find((f: any) => f.slot == -1)?.prioritizationFee ??
        Math.max(...feeData.map((f: any) => f.prioritizationFee))

    logger.debug(`Priority fee estimates: ${microLamports}`)

    return ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
}
