import { PublicKey } from '@solana/web3.js'
import { getAllFleetsForUserPublicKey } from '@staratlas/factory'
import Big from 'big.js'

import dayjs from '../dayjs'
import { Wallet } from '../db/entities'
import { logger } from '../logger'
import { getResourcePrices } from '../service/gm'
import { AD, connection, fleetProgram } from '../service/sol'

import { max } from './const'
import { refillPlayer } from './refill-player'
import { optimalRefillStrategy } from './refill-strategy'
import { getDailyBurnRate } from './stock-resources'

export const refill = async (): Promise<void> => {
    const players = await Wallet.findBy({ enabled: true })

    for (const player of players) {
        if (dayjs().isAfter(player.nextRefill)) {
            await refillPlayer(
                new PublicKey(player.publicKey),
                optimalRefillStrategy,
            )
        }

        const fleets = await getAllFleetsForUserPublicKey(
            connection,
            new PublicKey(player.publicKey),
            fleetProgram,
        )
        const burnRate = await getDailyBurnRate(fleets)
        const price = getResourcePrices()
        const balance = await player.getBalance()

        const burnPerDay = max(
            burnRate.food
                .mul(price.food)
                .add(burnRate.fuel.mul(price.fuel))
                .add(burnRate.tool.mul(price.tool))
                .add(burnRate.fuel.mul(price.ammo)),
            Big(0.00000001),
        )

        const balanceTime = balance.div(burnPerDay)

        await player.reload()

        logger.info('-----------------------------------------------------')
        logger.info(
            `${player.publicKey} next refill in ${dayjs.duration(dayjs().diff(player.nextRefill, 'second'), 'second').humanize()}`,
        )
        logger.info(
            `Balance: ${balance.toFixed(AD)} ATLAS / Burn ${burnPerDay.toFixed(AD)} ATLAS per day / Credit for ${dayjs.duration(balanceTime.toNumber(), 'day').humanize(false)}`,
        )
        logger.info(`Total Tipped: ${(await player.totalTipped()).toFixed(AD)}`)
        logger.info('-----------------------------------------------------')
    }
}
