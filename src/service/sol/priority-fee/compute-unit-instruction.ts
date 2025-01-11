import {
    AddressLookupTableAccount,
    ComputeBudgetProgram,
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js'

import { logger } from '../../../logger'
import { keyPair } from '../../wallet'
import { connection } from '../const'

const getSimulationUnits = async (
    instructions: TransactionInstruction[],
    payer: PublicKey,
    lookupTables: AddressLookupTableAccount[],
): Promise<number | undefined> => {
    const testInstructions = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        ...instructions,
    ]

    const testVersionedTxn = new VersionedTransaction(
        new TransactionMessage({
            instructions: testInstructions,
            payerKey: payer,
            recentBlockhash: PublicKey.default.toString(),
        }).compileToV0Message(lookupTables),
    )

    const simulation = await connection.simulateTransaction(testVersionedTxn, {
        replaceRecentBlockhash: true,
        sigVerify: false,
    })

    if (simulation.value.err) {
        return undefined
    }

    return simulation.value.unitsConsumed
}

export const createComputeUnitInstruction = async (
    instructions: TransactionInstruction[],
): Promise<TransactionInstruction> => {
    const units = (await getSimulationUnits(instructions, keyPair.publicKey, []) ?? 200_000) * 1.1

    logger.debug(`Esitmated Compute Units: ${units}`)

    return ComputeBudgetProgram.setComputeUnitLimit({ units })
}
