import { Transaction } from '@solana/web3.js'
import * as bs58 from 'bs58'

import { keyPair } from '../wallet'

import { connection } from './const'
import { finalize } from './finalize'

export const sendAndConfirmTransaction = async (transaction: Transaction): Promise<string> => {
    transaction.recentBlockhash = (
        await connection.getLatestBlockhash('finalized')
    ).blockhash

    transaction.sign(keyPair, keyPair)

    const txId = transaction.signatures[0].signature

    if (!txId) {
        throw new Error('Could not derive transaction signature')
    }

    const txIdStr = bs58.encode(txId)

    const wireTransaction = transaction.serialize()

    await connection.sendRawTransaction(wireTransaction)

    await finalize(txIdStr)

    return txIdStr
}
