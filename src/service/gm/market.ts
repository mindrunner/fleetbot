import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, GmClientService, GmOrderbookService } from '@staratlas/factory'
import Big from 'big.js'

import { Sentry } from '../../sentry'

import { logger } from '../../logger'
import { Amounts } from '../fleet/const'
import { connection, marketProgram } from '../sol'
import { sendAndConfirmTransaction } from '../sol/send-and-confirm-transaction'
import { keyPair, resource } from '../wallet'

const gmClientService = new GmClientService()
const gmOrderbookService = new GmOrderbookService(connection, marketProgram)

export const getMarketPrice = (res: PublicKey): Big => {
    const orders =
        gmOrderbookService.getSellOrdersByCurrencyAndItem(resource.atlas.toString(), res.toString())
            .sort((a, b) => a.uiPrice - b.uiPrice)

    return Big(orders[0].uiPrice)
}

export const getResourcePrices = (): Amounts => ({
    food: getMarketPrice(resource.food),
    tool: getMarketPrice(resource.tool),
    ammo: getMarketPrice(resource.ammo),
    fuel: getMarketPrice(resource.fuel)
})

export const getBalanceAtlas = async (pubKey: PublicKey): Promise<Big> => {
    try {
        const token = new Token(connection, resource.atlas, TOKEN_PROGRAM_ID, new Keypair())
        const balance = await token.getOrCreateAssociatedAccountInfo(pubKey)

        return Big(Number(balance.amount)).div(100000000)
    }
    catch (e) {
        Sentry.captureException(e)
        logger.error(e)

        return Big(0)
    }
}

export const sendAtlas = async (receiver: PublicKey, amount: number): Promise<string> => {
    const transaction = new Transaction().add(
        Token.createTransferCheckedInstruction(
            TOKEN_PROGRAM_ID,
            await getAssociatedTokenAddress(keyPair.publicKey, resource.atlas),
            resource.atlas,
            await getAssociatedTokenAddress(receiver, resource.atlas),
            keyPair.publicKey,
            [],
            Big(amount).mul(100000000).toNumber(),
            8
        )
    )

    return sendAndConfirmTransaction(transaction)

    // return sendAndConfirmTransaction(connection, transaction, [keyPair], {
    //     skipPreflight: false, maxRetries: 10, commitment: 'finalized'
    // })
}

export const getBalanceMarket = async (pubKey: PublicKey, res: PublicKey): Promise<Big> => {
    const token = new Token(connection, res, TOKEN_PROGRAM_ID, new Keypair())
    const balance = await token.getOrCreateAssociatedAccountInfo(pubKey)

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
    await initOrderBook()

    const orders =
        gmOrderbookService.getSellOrdersByCurrencyAndItem(resource.atlas.toString(), res.toString())
            .sort((a, b) => a.uiPrice - b.uiPrice)

    const exchangeTx = await gmClientService.getCreateExchangeTransaction(
        connection,
        orders[0],
        keyPair.publicKey,
        amount.round().toNumber(),
        marketProgram
    )

    logger.info(`Buying ${amount.toFixed(0)} ${res} for ${orders[0].uiPrice} each`)

    return sendAndConfirmTransaction(exchangeTx.transaction)

    // return sendAndConfirmTransaction(connection, exchangeTx.transaction, [keyPair, ...exchangeTx.signers], {
    //     skipPreflight: false, maxRetries: 10, commitment: 'finalized'
    // })
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
