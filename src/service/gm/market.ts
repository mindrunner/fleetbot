import {
    createTransferCheckedInstruction,
    getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token'
import { Keypair, PublicKey } from '@solana/web3.js'
import {
    GmClientService,
    GmOrderbookService,
    Order,
    getAssociatedTokenAddress,
} from '@staratlas/factory'
import Big from 'big.js'

import { Sentry } from '../../sentry'

import { logger } from '../../logger'
import { Amounts } from '../fleet/const'
import { connection, marketProgram } from '../sol'
import { sendAndConfirmInstructions } from '../sol/send-and-confirm-tx'
import { keyPair, resource } from '../wallet'

const gmClientService = new GmClientService()
const gmOrderbookService = new GmOrderbookService(connection, marketProgram)

const orderSorter = (a: Order, b: Order) => a.price.sub(b.price).toNumber()

export const getMarketPrice = (res: PublicKey): Big => {
    const orders = gmOrderbookService
        .getSellOrdersByCurrencyAndItem(
            resource.atlas.toString(),
            res.toString(),
        )
        .sort(orderSorter)

    const [order] = orders

    return Big(order.uiPrice)
}

export const getResourcePrices = (): Amounts => ({
    food: getMarketPrice(resource.food),
    tool: getMarketPrice(resource.tool),
    ammo: getMarketPrice(resource.ammo),
    fuel: getMarketPrice(resource.fuel),
})

export const getBalanceAtlas = async (pubKey: PublicKey): Promise<Big> => {
    try {
        const balance = await getOrCreateAssociatedTokenAccount(
            connection,
            new Keypair(),
            resource.atlas,
            pubKey,
        )

        return Big(Number(balance.amount)).div(100000000)
    } catch (e) {
        Sentry.captureException(e)
        logger.error(e)

        return Big(0)
    }
}

export const sendAtlas = async (
    receiver: PublicKey,
    amount: number,
): Promise<string> => {
    const instructions = [
        createTransferCheckedInstruction(
            await getAssociatedTokenAddress(keyPair.publicKey, resource.atlas),
            resource.atlas,
            await getAssociatedTokenAddress(receiver, resource.atlas),
            keyPair.publicKey,
            Big(amount).mul(100000000).toNumber(),
            8,
            [],
        ),
    ]

    return await sendAndConfirmInstructions(instructions)
}

export const getBalanceMarket = async (
    pubKey: PublicKey,
    res: PublicKey,
): Promise<Big> => {
    const balance = await getOrCreateAssociatedTokenAccount(
        connection,
        new Keypair(),
        res,
        pubKey,
    )

    return Big(Number(balance.amount))
}

export const getResourceBalances = async (
    player: PublicKey,
): Promise<Amounts> => {
    const [tool, food, ammo, fuel] = await Promise.all([
        getBalanceMarket(player, resource.tool),
        getBalanceMarket(player, resource.food),
        getBalanceMarket(player, resource.ammo),
        getBalanceMarket(player, resource.fuel),
    ])

    return { food, tool, ammo, fuel }
}

export const initOrderBook = async (): Promise<void> => {
    await gmOrderbookService.initialize()
}

export const buyResource = async (
    res: PublicKey,
    amount: Big,
): Promise<string> => {
    const orders = gmOrderbookService
        .getSellOrdersByCurrencyAndItem(
            resource.atlas.toString(),
            res.toString(),
        )
        .sort(orderSorter)

    const [order] = orders

    const exchangeTx = await gmClientService.getCreateExchangeTransaction(
        connection,
        order,
        keyPair.publicKey,
        amount.round().toNumber(),
        marketProgram,
    )

    logger.info(`Buying ${amount.toFixed(0)} ${res} for ${order.uiPrice} each`)

    return await sendAndConfirmInstructions(exchangeTx.transaction.instructions)
}
export const buyResources = async (amount: Amounts): Promise<string[]> => {
    const res = await Promise.all([
        amount.food.gt(0)
            ? buyResource(resource.food, amount.food)
            : Promise.resolve(''),
        amount.ammo.gt(0)
            ? buyResource(resource.ammo, amount.ammo)
            : Promise.resolve(''),
        amount.fuel.gt(0)
            ? buyResource(resource.fuel, amount.fuel)
            : Promise.resolve(''),
        amount.tool.gt(0)
            ? buyResource(resource.tool, amount.tool)
            : Promise.resolve(''),
    ])

    return res.filter((r) => r !== '')
}
