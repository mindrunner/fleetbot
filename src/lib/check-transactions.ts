import { LessThan, MoreThan } from 'typeorm'

import dayjs from '../dayjs'
import { Transaction, Wallet } from '../db/entities'
import { logger } from '../logger'
import { getBalanceAtlas, getResourceBalances, getResourcePrices, initOrderBook } from '../service/gm'
import { AD } from '../service/sol'
import { keyPair, resource } from '../service/wallet'

import { checkAtlasTransactions } from './check-atlas-transactions'
import { checkR4Transactions } from './check-r4-transactions'

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

    let getSigOptions

    if (lastInTx && lastOutTx) {
        const until = dayjs(lastInTx.time).isBefore(lastOutTx.time) ? lastInTx.signature : lastOutTx.signature

        getSigOptions = { until }
    }

    logger.info(`Total balance: ${total.toFixed(AD)} ATLAS`)

    await checkAtlasTransactions(getSigOptions)

    const wallets = await Wallet.findBy({ enabled: true })

    for (const wallet of wallets) {
        // eslint-disable-next-line no-await-in-loop
        await checkR4Transactions(wallet, 'tool', resource.tool, prices, getSigOptions)
        // eslint-disable-next-line no-await-in-loop
        await checkR4Transactions(wallet, 'ammo', resource.ammo, prices, getSigOptions)
        // eslint-disable-next-line no-await-in-loop
        await checkR4Transactions(wallet, 'food', resource.food, prices, getSigOptions)
        // eslint-disable-next-line no-await-in-loop
        await checkR4Transactions(wallet, 'fuel', resource.fuel, prices, getSigOptions)
    }
}
