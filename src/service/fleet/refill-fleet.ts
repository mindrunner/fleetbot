import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { createRearmInstruction, createRefeedInstruction, createRefuelInstruction, createRepairInstruction, ShipStakingInfo } from '@staratlas/factory'

import { connection, fleetProgram, getAccount } from '../sol'
import { sendAndConfirmTransaction } from '../sol/send-and-confirm-transaction'
import { keyPair, resource } from '../wallet'

import { Amounts } from './const'

export const refillFleet = async (player: PublicKey, fleetUnit: ShipStakingInfo, amounts: Amounts): Promise<string> => {
    const [foodAccount, fuelAccount, ammoAccount, toolAccount] = await Promise.all([
        getAccount(keyPair.publicKey, resource.food),
        getAccount(keyPair.publicKey, resource.fuel),
        getAccount(keyPair.publicKey, resource.ammo),
        getAccount(keyPair.publicKey, resource.tool)
    ])

    const transaction = new Transaction({ feePayer: keyPair.publicKey })

    if (amounts.food.gt(0)) {
        transaction.add(
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
        transaction.add(
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
        transaction.add(
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
        transaction.add(
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

    return sendAndConfirmTransaction(transaction)

    // return sendAndConfirmTransaction(connection, transaction, [keyPair, keyPair], {
    //     skipPreflight: false, maxRetries: 10, commitment: 'finalized'
    // })

    // return sendAndConfirmTransaction(connection, transaction, [keyPair, keyPair])
}
