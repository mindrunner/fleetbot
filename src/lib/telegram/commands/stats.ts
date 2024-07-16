import { PublicKey } from '@solana/web3.js'
import { getAllFleetsForUserPublicKey } from '@staratlas/factory'
import Big from 'big.js'
import { Telegraf } from 'telegraf'
import { Between, MoreThanOrEqual } from 'typeorm'

import dayjs from '../../../dayjs'
import { Refill } from '../../../db/entities'
import { getResourcePrices } from '../../../service/gm'
import { AD, connection, fleetProgram } from '../../../service/sol'
import { getDailyBurnRate, getPendingRewards } from '../../stock-resources'
import { ContextMessageUpdate } from '../context-message-update'
import { unauthorized } from '../response'

export const stats = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['stats'], async (ctx: ContextMessageUpdate) => {
        if (!ctx.user || !ctx.authed) {
            await unauthorized(ctx)

            return
        }

        if (!ctx.user.enabled) {
            await ctx.reply(
                'Your wallet is currently disabled, toggle with /enable command',
            )

            return
        }

        await ctx.reply('Gathering statistics, hold on...')
        await ctx.persistentChatAction('typing', async () => {
            const player = ctx.user

            if (player) {
                const fleets = await getAllFleetsForUserPublicKey(
                    connection,
                    new PublicKey(player.publicKey),
                    fleetProgram,
                )
                const [burnRate, price, playerBalance, pendingRewards] =
                    await Promise.all([
                        getDailyBurnRate(fleets),
                        getResourcePrices(),
                        player.getBalance(),
                        getPendingRewards(fleets),
                    ])
                const burnPerDay = burnRate.food
                    .mul(price.food)
                    .add(burnRate.fuel.mul(price.fuel))
                    .add(burnRate.tool.mul(price.tool))
                    .add(burnRate.fuel.mul(price.ammo))
                const balanceTime = burnPerDay.gt(0)
                    ? playerBalance.div(burnPerDay)
                    : Big(0)

                const diffToNextRefill = dayjs().diff(
                    player.nextRefill,
                    'second',
                )

                const todayRefills = await Refill.findBy({
                    walletPublicKey: player.publicKey,
                    time: MoreThanOrEqual(dayjs().startOf('day').toDate()),
                })
                const burnToday = todayRefills.reduce(
                    (curr, acc) => curr.add(acc.price),
                    Big(0),
                )

                const yesterdayRefills = await Refill.findBy({
                    walletPublicKey: player.publicKey,
                    time: Between(
                        dayjs().subtract(1, 'day').startOf('day').toDate(),
                        dayjs().subtract(1, 'day').endOf('day').toDate(),
                    ),
                })
                const burnYesterday = yesterdayRefills.reduce(
                    (curr, acc) => curr.add(acc.price),
                    Big(0),
                )

                const refills7d = await Refill.findBy({
                    walletPublicKey: player.publicKey,
                    time: MoreThanOrEqual(
                        dayjs().subtract(7, 'day').startOf('day').toDate(),
                    ),
                })
                const burn7d = refills7d.reduce(
                    (curr, acc) => curr.add(acc.price),
                    Big(0),
                )

                const refills30d = await Refill.findBy({
                    walletPublicKey: player.publicKey,
                    time: MoreThanOrEqual(
                        dayjs().subtract(30, 'day').startOf('day').toDate(),
                    ),
                })
                const burn30d = refills30d.reduce(
                    (curr, acc) => curr.add(acc.price),
                    Big(0),
                )

                const avg = (b: Big[]) =>
                    b.reduce((c, a) => c.add(a), Big(0)).div(b.length)

                const burnAvg7 = burn7d.div(7)
                const burnAvg30 = burn30d.div(30)

                const burnAvg = avg([burnAvg7, burnAvg30])

                const drift = burnAvg.sub(burnPerDay)

                await ctx.replyWithMarkdownV2(
                    `
*Next refill in:*  ${dayjs.duration(diffToNextRefill, 'second').humanize()}
*Balance:* ${playerBalance.toFixed(AD)} ATLAS
*Burn \\(estimate\\):* ${burnPerDay.toFixed(AD)} ATLAS per day
*Burn \\(today\\):* ${burnToday.toFixed(AD)} ATLAS \\(${todayRefills.length} refills\\)
*Burn \\(yesterday\\):* ${burnYesterday.toFixed(AD)} ATLAS \\(${yesterdayRefills.length} refills\\)
*Burn \\(7d\\):* ${burn7d.toFixed(AD)} ATLAS \\(${refills7d.length} refills\\) \\[avg.: ${burnAvg7.toFixed(AD)} / day\\]
*Burn \\(30d\\):* ${burn30d.toFixed(AD)} ATLAS \\(${refills30d.length} refills\\) \\[avg.: ${burnAvg30.toFixed(AD)} / day\\]
*Drift:* ${drift.toFixed(AD).toString().replace('-', '\\-')} ATLAS
*Pending Rewards:* ${pendingRewards.toFixed(AD)} ATLAS
*Credit for:* ${dayjs.duration(balanceTime.toNumber(), 'day').humanize(false)}
*Current Tips:* ${player.tip * 100} %`.replace(/\./g, '\\.'),
                )
            }
        })
    })
}
