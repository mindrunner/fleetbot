import { LessThan, MoreThan } from 'typeorm'

import dayjs from '../dayjs.js'
import { Transaction } from '../db/entities/transaction.js'
import { Wallet } from '../db/entities/wallet.js'
import { logger } from '../logger.js'
import {
    getBalanceAtlas,
    getResourceBalances,
    getResourcePrices,
} from '../service/gm/index.js'
import { AD } from '../service/sol/index.js'
import { keyPair, resource } from '../service/wallet/index.js'

import { checkAtlasTransactions } from './check-atlas-transactions.js'
import { checkR4Transactions } from './check-r4-transactions.js'

export const checkTransactions = async (): Promise<void> => {
    const atlasBalance = await getBalanceAtlas(keyPair.publicKey)
    const prices = getResourcePrices()
    const resources = await getResourceBalances(keyPair.publicKey)

    logger.info(`ATLAS balance: ${atlasBalance.toFixed(AD)}`)
    logger.info(
        `FOOD balance: ${resources.food} (${resources.food.mul(prices.food).toFixed(AD)} ATLAS)`,
    )
    logger.info(
        `TOOL balance: ${resources.tool} (${resources.tool.mul(prices.tool).toFixed(AD)} ATLAS)`,
    )
    logger.info(
        `FUEL balance: ${resources.fuel} (${resources.fuel.mul(prices.fuel).toFixed(AD)} ATLAS)`,
    )
    logger.info(
        `AMMO balance: ${resources.ammo} (${resources.ammo.mul(prices.ammo).toFixed(AD)} ATLAS)`,
    )

    const total = atlasBalance
        .add(resources.food.mul(prices.food))
        .add(resources.ammo.mul(prices.ammo))
        .add(resources.fuel.mul(prices.fuel))
        .add(resources.tool.mul(prices.tool))

    const [[lastInTx], [lastOutTx]] = await Promise.all([
        Transaction.find({
            where: { amount: MoreThan(0) },
            order: { time: 'DESC' },
            take: 1,
        }),
        Transaction.find({
            where: { amount: LessThan(0) },
            order: { time: 'DESC' },
            take: 1,
        }),
    ])

    let getSigOptions

    if (lastInTx && lastOutTx) {
        const until = dayjs(lastInTx.time).isBefore(lastOutTx.time)
            ? lastInTx.signature
            : lastOutTx.signature

        getSigOptions = { until }
    }

    logger.info(`Total balance: ${total.toFixed(AD)} ATLAS`)

    await checkAtlasTransactions(getSigOptions)

    const wallets = await Wallet.findBy({ enabled: true })

    for (const wallet of wallets) {
        await checkR4Transactions(
            wallet,
            'tool',
            resource.tool,
            prices,
            getSigOptions,
        )

        await checkR4Transactions(
            wallet,
            'ammo',
            resource.ammo,
            prices,
            getSigOptions,
        )

        await checkR4Transactions(
            wallet,
            'food',
            resource.food,
            prices,
            getSigOptions,
        )

        await checkR4Transactions(
            wallet,
            'fuel',
            resource.fuel,
            prices,
            getSigOptions,
        )
    }
}
