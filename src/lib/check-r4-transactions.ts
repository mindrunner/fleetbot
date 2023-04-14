// eslint-disable-next-line import/named
import { ParsedInstruction, ParsedTransactionWithMeta, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@staratlas/factory'
import Big from 'big.js'

import dayjs from '../dayjs'
import { Transaction, Wallet } from '../db/entities'
import { logger } from '../logger'
import { Amounts } from '../service/fleet/const'
import { AD, connection } from '../service/sol'
import { keyPair } from '../service/wallet'

import { ensureWallet } from './ensure-wallet'
import { getPrice } from './get-price'

type ResourceName = 'food' | 'tool' | 'fuel' | 'ammo'

export const checkR4Transactions = async (
    wallet: Wallet,
    resourceName: ResourceName,
    resource: PublicKey,
    options: SignaturesForAddressOptions): Promise<void> => {
    const tokenAccount = await getAssociatedTokenAddress(new PublicKey(wallet.publicKey), resource)

    const signatureList = await connection.getSignaturesForAddress(tokenAccount, options)

    const transactionList = await connection.getParsedTransactions(signatureList.map(s => s.signature))

    const txList: ParsedTransactionWithMeta[] =
        transactionList.filter((tx): tx is ParsedTransactionWithMeta => tx !== null)

    const transferList = txList.filter(tx => tx.meta?.postTokenBalances?.length === 2)

    await Promise.all(
        transferList.map(tx => tx.transaction.message.instructions.map(async (instr) => {
            const instruction: ParsedInstruction = instr as ParsedInstruction

            if (instruction.program === 'spl-token' && instruction.parsed.info.mint === resource.toString()) {
                const { info } = instruction.parsed

                const sender = info.authority
                const originalAmount = info.tokenAmount.uiAmount
                const blockTime = tx.blockTime || 0
                const time = dayjs.unix(blockTime).toDate()
                const [signature] = tx.transaction.signatures

                const transaction = await Transaction.findOneBy({ signature })
                const log = transaction ? logger.debug : logger.info

                const amounts: Amounts = {
                    ammo: Big(0),
                    food: Big(0),
                    fuel: Big(0),
                    tool: Big(0)
                }

                amounts[resourceName] = Big(originalAmount)

                const price = await getPrice(amounts)

                if (sender === keyPair.publicKey.toString()) {
                    const receiver = tx.meta?.postTokenBalances?.filter(
                        tb => tb.owner?.toString() !== keyPair.publicKey.toString())[0].owner as string

                    log(`${receiver} -${originalAmount} ${resourceName.toUpperCase()} worth ${price.toFixed(AD)} ATLAS ${dayjs.duration(dayjs().diff(time)).humanize(false)} ago`)

                    await Transaction.create({
                        wallet: await ensureWallet(receiver),
                        amount: price.mul(-1).toNumber(),
                        originalAmount: Big(originalAmount).mul(-1).toNumber(),
                        resource: resourceName.toUpperCase(),
                        signature,
                        time
                    }).save()
                }
                else {
                    log(`${sender} +${originalAmount} ${resourceName.toUpperCase()} worth ${price.toFixed(AD)} ATLAS ${dayjs.duration(dayjs().diff(time)).humanize(false)} ago`)

                    await Transaction.create({
                        wallet: await ensureWallet(sender),
                        amount: price.toNumber(),
                        originalAmount,
                        resource: resourceName.toUpperCase(),
                        signature,
                        time
                    }).save()
                }
            }
        })))
}
