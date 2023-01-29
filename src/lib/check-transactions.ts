// eslint-disable-next-line import/named
import { ParsedInstruction, ParsedTransactionWithMeta } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@staratlas/factory'
import { LessThan, MoreThan } from 'typeorm'

import dayjs from '../dayjs'
import { Transaction, Wallet } from '../db/entities'
import { logger } from '../logger'
import { getBalanceAtlas, getResourceBalances, getResourcePrices, initOrderBook } from '../service/gm'
import { AD, connection } from '../service/sol'
import { keyPair, resource } from '../service/wallet'

export const checkTransactions = async (): Promise<void> => {
    await initOrderBook()
    const atlasBalance = await getBalanceAtlas(keyPair.publicKey)
    const prices = await getResourcePrices()
    const resources = await getResourceBalances(keyPair.publicKey)

    logger.info(`ATLAS balance: ${atlasBalance.toFixed(AD)}`)
    logger.info(`FOOD balance: ${resources.food} (${resources.food.mul(prices.food).toFixed(AD)} ATLAS)`)
    logger.info(`TOOL balance: ${resources.tool} (${resources.tool.mul(prices.tool).toFixed(AD)} ATLAS)`)
    logger.info(`FUEL balance: ${resources.fuel} (${resources.fuel.mul(prices.fuel).toFixed(AD)} ATLAS)`)
    logger.info(`AMMO balance: ${resources.ammo} (${resources.ammo.mul(prices.ammo).toFixed(AD)} ATLAS)`)

    const total = atlasBalance.add(
        resources.food.mul(prices.food)).add(
        resources.ammo.mul(prices.ammo)).add(
        resources.fuel.mul(prices.fuel)).add(
        resources.tool.mul(prices.tool))

    const [[lastInTx], [lastOutTx]] = await Promise.all([
        Transaction.find({ where: { amount: MoreThan(0) }, order: { time: 'DESC' }, take: 1 }),
        Transaction.find({ where: { amount: LessThan(0) }, order: { time: 'DESC' }, take: 1 })
    ])

    const until = dayjs(lastInTx.time).isBefore(lastOutTx.time) ? lastInTx.signature : lastOutTx.signature
    const getSigOptions = { until }

    logger.info(`Total balance: ${total.toFixed(AD)} ATLAS`)
    const atlasTokenAccount = await getAssociatedTokenAddress(keyPair.publicKey, resource.atlas)
    const signatureList = await connection.getSignaturesForAddress(atlasTokenAccount, getSigOptions)

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
                        tb => tb.owner?.toString() !== keyPair.publicKey.toString())[0].owner

                    log(`${receiver} -${amount} ATLAS ${dayjs.duration(dayjs().diff(time)).humanize(false)} ago`)
                    const wallet = Wallet.create({ publicKey: receiver })

                    await wallet.save()
                    await Transaction.create({ wallet, amount: -amount, signature, time }).save()
                }
                else {
                    log(`${sender} +${amount} ATLAS ${dayjs.duration(dayjs().diff(time)).humanize(false)} ago`)

                    let wallet = await Wallet.findOneBy({ publicKey: sender })

                    if (wallet?.telegramId && !wallet.authed && dayjs().isBefore(wallet.authExpire) && !transaction) {
                        if (wallet.authTxAmount === amount) {
                            wallet.authed = true

                            logger.info(`Successfully assigned ${wallet.telegramId} to ${wallet.publicKey}`)
                        }
                        else {
                            logger.warn(`Amount mismatch, got ${amount}, expected ${wallet.authTxAmount}`)
                        }
                    }
                    if (!wallet) {
                        wallet = Wallet.create({ publicKey: sender })
                    }

                    await wallet.save()
                    await Transaction.create({ wallet, amount, signature, time }).save()
                }
            }
        })))
}
