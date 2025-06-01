import {
    AddressLookupTableAccount,
    ComputeBudgetProgram,
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js'
import base58 from 'bs58'
import { config } from '../../../config/index.js'

import { logger } from '../../../logger.js'
import { programs } from '../../../main/basedbot/lib/programs.js'
import { keyPair } from '../../wallet/index.js'
import { rpcFetch } from '../rpc-fetch.js'

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
    let encodedTx: string | undefined
    try {
        encodedTx = base58.encode(transaction.serialize())
    } catch (e) {
        logger.error((e as any).message)
    }

    try {
        const result =
            config.sol.rpcEndpoint.includes('devnet') ||
            config.sol.rpcEndpoint.includes('validator') ||
            config.sol.rpcEndpoint.includes('localhost')
                ? await rpcFetch({
                      jsonrpc: '2.0',
                      id: 1,
                      method: 'getRecentPrioritizationFees',
                      params: [[programs.sage.programId.toBase58()]],
                  })
                : await rpcFetch({
                      jsonrpc: '2.0',
                      id: 1,
                      method: 'getRecentPrioritizationFees',
                      params: {
                          transaction: encodedTx,
                          percentiles: [50, 75, 95, 100],
                          lookbackSlots: 10,
                      },
                  })

        const feeData = (result as any).result.result as Array<{
            slot: number
            prioritizationFee: number
        }>

        const microLamports =
            feeData.find((f: any) => f.slot == -1)?.prioritizationFee ??
            Math.max(...feeData.map((f: any) => f.prioritizationFee))

        // const microLamports = 5000
        logger.debug(`Priority fee estimates: ${microLamports}`)

        const feeLimit = config.sol.feeLimit
        if (feeLimit > 0 && microLamports > feeLimit) {
            logger.debug(`Capping fee at ${feeLimit}`)
        }
        return ComputeBudgetProgram.setComputeUnitPrice({
            microLamports:
                feeLimit > 0
                    ? Math.min(feeLimit, microLamports)
                    : microLamports,
        })
    } catch (e) {
        logger.error((e as any).message)
        return ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 5000,
        })
    }
}
