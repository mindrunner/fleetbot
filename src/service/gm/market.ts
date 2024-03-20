import { Keypair, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, GmClientService, GmOrderbookService, Order } from '@staratlas/factory'
import Big from 'big.js'
import { createTransferCheckedInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token'

import { Sentry } from '../../sentry'

import { logger } from '../../logger'
import { Amounts } from '../fleet/const'
import { connection, marketProgram } from '../sol'
import { keyPair, resource } from '../wallet'

const gmClientService = new GmClientService()
const gmOrderbookService = new GmOrderbookService(connection, marketProgram)

const orderSorter = (a: Order, b: Order) => a.price.sub(b.price).toNumber()

export const getMarketPrice = (res: PublicKey): Big => {
    const orders =
        gmOrderbookService.getSellOrdersByCurrencyAndItem(resource.atlas.toString(), res.toString())
            .sort(orderSorter)

    const [order] = orders

    return Big(order.uiPrice)
}

export const getResourcePrices = (): Amounts => ({
    food: getMarketPrice(resource.food),
    tool: getMarketPrice(resource.tool),
    ammo: getMarketPrice(resource.ammo),
    fuel: getMarketPrice(resource.fuel)
})

export const getBalanceAtlas = async (pubKey: PublicKey): Promise<Big> => {
    try {
        const balance = await getOrCreateAssociatedTokenAccount(connection, new Keypair(), resource.atlas, pubKey)

        return Big(Number(balance.amount)).div(100000000)
    }
    catch (e) {
        Sentry.captureException(e)
        logger.error(e)

        return Big(0)
    }
}

export const sendAtlas = async (receiver: PublicKey, amount: number): Promise<string> => {
    const latestBlockHash = await connection.getLatestBlockhash()

    const messageV0 = new TransactionMessage({
        payerKey: keyPair.publicKey,
        recentBlockhash: latestBlockHash.blockhash,
        instructions: [ createTransferCheckedInstruction(
            await getAssociatedTokenAddress(keyPair.publicKey, resource.atlas),
            resource.atlas,
            await getAssociatedTokenAddress(receiver, resource.atlas),
            keyPair.publicKey,
            Big(amount).mul(100000000).toNumber(),
            8,
            [],
        )]
    }).compileToV0Message()

    const transaction = new VersionedTransaction(messageV0)

    transaction.sign([keyPair, keyPair])

    const txid = await connection.sendTransaction(transaction)

    logger.info(`https://solscan.io/tx/${txid}`)

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid
    })

    return txid
}

export const getBalanceMarket = async (pubKey: PublicKey, res: PublicKey): Promise<Big> => {
    const balance = await getOrCreateAssociatedTokenAccount(connection, new Keypair(), res, pubKey)

    return Big(Number(balance.amount))
}

export const getResourceBalances = async (player: PublicKey): Promise<Amounts> => {
    const [tool, food, ammo, fuel] = await Promise.all([
        getBalanceMarket(player, resource.tool),
        getBalanceMarket(player, resource.food),
        getBalanceMarket(player, resource.ammo),
        getBalanceMarket(player, resource.fuel)

    ])

    return { food, tool, ammo, fuel }
}

export const initOrderBook = async (): Promise<void> => {
    await gmOrderbookService.initialize()
}

export const buyResource = async (res: PublicKey, amount: Big): Promise<string> => {
    const orders =
        gmOrderbookService.getSellOrdersByCurrencyAndItem(resource.atlas.toString(), res.toString())
            .sort(orderSorter)

    const [order] = orders

    const exchangeTx = await gmClientService.getCreateExchangeTransaction(
        connection,
        order,
        keyPair.publicKey,
        amount.round().toNumber(),
        marketProgram
    )

    logger.info(`Buying ${amount.toFixed(0)} ${res} for ${order.uiPrice} each`)

    const latestBlockHash = await connection.getLatestBlockhash()

    const messageV0 = new TransactionMessage({
        payerKey: keyPair.publicKey,
        recentBlockhash: latestBlockHash.blockhash,
        instructions: exchangeTx.transaction.instructions
    }).compileToV0Message()

    const transaction = new VersionedTransaction(messageV0)

    transaction.sign([keyPair, keyPair])

    const txid = await connection.sendTransaction(transaction)

    logger.info(`https://solscan.io/tx/${txid}`)

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid
    })

    return txid
}
export const buyResources = (amount: Amounts): Promise<string[]> => {
    const buyPromises: Array<Promise<string>> = []

    if (amount.food.gt(0)) {
        buyPromises.push(buyResource(resource.food, amount.food))
    }
    if (amount.ammo.gt(0)) {
        buyPromises.push(buyResource(resource.ammo, amount.ammo))
    }
    if (amount.fuel.gt(0)) {
        buyPromises.push(buyResource(resource.fuel, amount.fuel))
    }
    if (amount.tool.gt(0)) {
        buyPromises.push(buyResource(resource.tool, amount.tool))
    }

    return Promise.all(buyPromises)
}
