import { ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js'

import { config } from '../../../config'

export const createPriorityFeeInstruction = (): TransactionInstruction => {
    const { priorityFee } = config.sol

    return ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee })
}
