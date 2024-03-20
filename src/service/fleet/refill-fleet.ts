import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { createRearmInstruction, createRefeedInstruction, createRefuelInstruction, createRepairInstruction, ShipStakingInfo } from '@staratlas/factory'

import { config } from '../../config'
import { logger } from '../../logger'
import { connection, fleetProgram, getAccount } from '../sol'
import { createPriorityFeeInstruction } from '../sol/priority-fee/priority-fee-instruction'
import { keyPair, resource } from '../wallet'

import { Amounts } from './const'

export const refillFleet = async (player: PublicKey, fleetUnit: ShipStakingInfo, amounts: Amounts): Promise<string> => {
    const [foodAccount, fuelAccount, ammoAccount, toolAccount] = await Promise.all([
        getAccount(keyPair.publicKey, resource.food),
        getAccount(keyPair.publicKey, resource.fuel),
        getAccount(keyPair.publicKey, resource.ammo),
        getAccount(keyPair.publicKey, resource.tool)
    ])

    const instructions: TransactionInstruction[] = []

    if (amounts.food.gt(0)) {
        instructions.push(
            new TransactionInstruction(
                await createRefeedInstruction(
                    connection,
                    keyPair.publicKey,
                    player,
                    amounts.food.toNumber(),
                    fleetUnit.shipMint,
                    resource.food,
                    foodAccount,
                    fleetProgram)
            )
        )
    }
    if (amounts.fuel.gt(0)) {
        instructions.push(
            new TransactionInstruction(
                await createRefuelInstruction(connection,
                    keyPair.publicKey,
                    player,
                    amounts.fuel.toNumber(),
                    fleetUnit.shipMint,
                    resource.fuel,
                    fuelAccount,
                    fleetProgram)
            )
        )
    }
    if (amounts.ammo.gt(0)) {
        instructions.push(
            new TransactionInstruction(
                await createRearmInstruction(connection,
                    keyPair.publicKey,
                    player,
                    amounts.ammo.toNumber(),
                    fleetUnit.shipMint,
                    resource.ammo,
                    ammoAccount,
                    fleetProgram)
            )
        )
    }
    if (amounts.tool.gt(0)) {
        instructions.push(
            new TransactionInstruction(
                await createRepairInstruction(connection,
                    keyPair.publicKey,
                    player,
                    amounts.tool.toNumber(),
                    fleetUnit.shipMint,
                    resource.tool,
                    toolAccount,
                    fleetProgram)
            )
        )
    }

    const latestBlockHash = await connection.getLatestBlockhash()

    if(config.sol.priorityFee > 0) {
        instructions.unshift(createPriorityFeeInstruction())
    }

    const messageV0 = new TransactionMessage({
        payerKey: keyPair.publicKey,
        recentBlockhash: latestBlockHash.blockhash,
        instructions
    }).compileToV0Message()

    const transaction = new VersionedTransaction(messageV0)

    transaction.sign([keyPair, keyPair])

    const txid = await connection.sendTransaction(transaction, { maxRetries: 10 })

    logger.info(`https://solscan.io/tx/${txid}`)

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid
    })

    return txid
}
