import { ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js'

import { logger } from '../../../logger'
import { connection } from '../const'

export const createPriorityFeeInstruction =
    async (): Promise<TransactionInstruction> => {
        const recentPriorityFees =
            await connection.getRecentPrioritizationFees()

        const maxPriorityFee = Math.max(
            ...recentPriorityFees.map((fee) => fee.prioritizationFee.valueOf()),
        )

        logger.debug(`Estimated priority fee: ${maxPriorityFee}`)

        return ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: maxPriorityFee,
        })
    }
