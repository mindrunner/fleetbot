// eslint-disable-next-line import/named
import { ParsedInstruction, ParsedTransactionWithMeta, SignaturesForAddressOptions } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@staratlas/factory'

import dayjs from '../dayjs'
import { Transaction } from '../db/entities'
import { logger } from '../logger'
import { connection } from '../service/sol'
import { keyPair, resource } from '../service/wallet'

import { ensureWallet } from './ensure-wallet'

export const checkAtlasTransactions = async (options?: SignaturesForAddressOptions): Promise<void> => {
    const atlasTokenAccount = await getAssociatedTokenAddress(keyPair.publicKey, resource.atlas)
    const signatureList = await connection.getSignaturesForAddress(atlasTokenAccount, options)

    const transactionList = await connection.getParsedTransactions(signatureList.map(s => s.signature))

    const txList: ParsedTransactionWithMeta[] =
        transactionList.filter((tx): tx is ParsedTransactionWithMeta => tx !== null)

    const transferList = txList.filter(tx => tx.meta?.postTokenBalances?.length === 2)

    await Promise.all(
        transferList.map(tx => tx.transaction.message.instructions.map(async (instr) => {
            const instruction: ParsedInstruction = instr as ParsedInstruction

            if (instruction.program === 'spl-token' && instruction.parsed.info.mint === resource.atlas.toString()) {
                const { info } = instruction.parsed

                const sender = info.authority
                const amount = info.tokenAmount.uiAmount
                const blockTime = tx.blockTime || 0
                const time = dayjs.unix(blockTime).toDate()
                const [signature] = tx.transaction.signatures

                const transaction = await Transaction.findOneBy({ signature })
                const log = transaction ? logger.debug : logger.info

                if (sender === keyPair.publicKey.toString()) {
                    const receiver = tx.meta?.postTokenBalances?.filter(
                        tb => tb.owner?.toString() !== keyPair.publicKey.toString())[0].owner as string

                    log(`${receiver} -${amount} ATLAS ${dayjs.duration(dayjs().diff(time)).humanize(false)} ago`)
                    const wallet = await ensureWallet(receiver)

                    const tr = await Transaction.findOneBy({ signature, resource: 'ATLAS' })

                    if (!tr) {
                        await Transaction.create({ wallet, amount: -amount, signature, time, originalAmount: amount, resource: 'ATLAS' }).save()
                    }
                }
                else {
                    log(`${sender} +${amount} ATLAS ${dayjs.duration(dayjs().diff(time)).humanize(false)} ago`)

                    const wallet = await ensureWallet(sender)

                    if (wallet.telegramId && !wallet.authed && dayjs().isBefore(wallet.authExpire) && !transaction) {
                        if (wallet.authTxAmount === amount) {
                            wallet.authed = true

                            logger.info(`Successfully assigned ${wallet.telegramId} to ${wallet.publicKey}`)
                        }
                        else {
                            logger.warn(`Amount mismatch, got ${amount}, expected ${wallet.authTxAmount}`)
                        }
                    }
                    const tr = await Transaction.findOneBy({ signature, resource: 'ATLAS' })

                    if (!tr) {
                        await Transaction.create({ wallet, amount, signature, time, originalAmount: amount, resource: 'ATLAS' }).save()
                    }
                }
            }
        })))
}
