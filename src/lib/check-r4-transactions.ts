import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import {
    ParsedInstruction,
    PublicKey,
    SignaturesForAddressOptions,
} from '@solana/web3.js'
import Big from 'big.js'

import dayjs from '../dayjs'
import { Transaction, Wallet } from '../db/entities'
import { TxCache } from '../db/entities/tx-cache'
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
    prices: Amounts,
    options?: SignaturesForAddressOptions,
): Promise<void> => {
    const sourceTokenAccount = getAssociatedTokenAddressSync(
        resource,
        new PublicKey(wallet.publicKey),
        true,
    )
    const destTokenAccount = getAssociatedTokenAddressSync(
        resource,
        new PublicKey(keyPair.publicKey),
        true,
    )

    const signatureList = await connection.getSignaturesForAddress(
        sourceTokenAccount,
        options,
    )

    logger.info(
        `${signatureList.length} transactions found for ${resourceName} on ${wallet.publicKey}`,
    )

    for (const signatureInfo of signatureList) {
        const { signature } = signatureInfo

        let tx = (await TxCache.findOneBy({ id: signature }))?.tx ?? null

        if (!tx) {
            // https://docs.solana.com/developing/versioned-transactions#max-supported-transaction-version
            tx = await connection.getParsedTransaction(signature, {
                maxSupportedTransactionVersion: 0,
            })
            if (tx) {
                await TxCache.create({ id: signature, tx }).save()
            }
        }

        if (!tx) {
            throw new Error('tx is null')
        }

        const balanceChangeLength = tx?.meta?.postTokenBalances?.length

        if (balanceChangeLength && balanceChangeLength >= 2) {
            for (const instr of tx.transaction.message.instructions) {
                const instruction: ParsedInstruction =
                    instr as ParsedInstruction

                if (
                    instruction.program === 'spl-token' &&
                    instruction.parsed.info.source ===
                        sourceTokenAccount.toBase58() &&
                    instruction.parsed.info.destination ===
                        destTokenAccount.toBase58()
                ) {
                    const { info } = instruction.parsed

                    const sender = info.authority ?? info.multisigAuthority
                    const originalAmount =
                        info.tokenAmount?.uiAmount || info.amount
                    const blockTime = tx.blockTime || 0
                    const time = dayjs.unix(blockTime).toDate()

                    const transaction = await Transaction.findOneBy({
                        signature,
                        resource: resourceName.toUpperCase(),
                    })
                    const log = transaction ? logger.debug : logger.info

                    const amounts: Amounts = {
                        ammo: Big(0),
                        food: Big(0),
                        fuel: Big(0),
                        tool: Big(0),
                    }

                    amounts[resourceName] = Big(originalAmount)

                    const price = getPrice(amounts, prices)

                    if (sender === keyPair.publicKey.toString()) {
                        const receiver = tx.meta?.postTokenBalances?.filter(
                            (tb) =>
                                tb.owner?.toString() !==
                                keyPair.publicKey.toString(),
                        )[0].owner as string

                        log(
                            `${receiver} -${originalAmount} ${resourceName.toUpperCase()} worth ${price.toFixed(AD)} ATLAS ${dayjs.duration(dayjs().diff(time)).humanize(false)} ago`,
                        )

                        if (!transaction) {
                            await Transaction.create({
                                wallet: await ensureWallet(receiver),
                                amount: price.mul(-1).toNumber(),
                                originalAmount: Big(originalAmount)
                                    .mul(-1)
                                    .toNumber(),
                                resource: resourceName.toUpperCase(),
                                signature,
                                time,
                            }).save()
                        }
                    } else {
                        log(
                            `${sender} +${originalAmount} ${resourceName.toUpperCase()} worth ${price.toFixed(AD)} ATLAS ${dayjs.duration(dayjs().diff(time)).humanize(false)} ago`,
                        )

                        if (!transaction) {
                            await Transaction.create({
                                wallet: await ensureWallet(sender),
                                amount: price.toNumber(),
                                originalAmount,
                                resource: resourceName.toUpperCase(),
                                signature,
                                time,
                            }).save()
                        }
                    }
                }
            }
        }
    }
}
