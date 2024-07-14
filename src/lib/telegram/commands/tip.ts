import Big from 'big.js'
import { Telegraf } from 'telegraf'

import { ContextMessageUpdate } from '../context-message-update'
import { unauthorized } from '../response'

export const tip = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['tip'], async (ctx) => {
        await ctx.persistentChatAction('typing', async () => {
            if (!ctx.user || !ctx.authed) {
                await unauthorized(ctx)

                return
            }

            if (ctx.params.length !== 1) {
                await ctx.reply(
                    `Tip is currently set to ${Big(ctx.user.tip).mul(100).toFixed()} %`,
                )
                await ctx.reply('To update setting, use /tip {percentage}')

                return
            }

            let [tipPercent] = ctx.params

            tipPercent = tipPercent.replace('%', '')
            try {
                ctx.user.tip = Big(tipPercent).div(100).abs().toNumber()
                await ctx.user.save()
            } catch {
                await ctx.reply('Tip amount must be be a positive number!')

                return
            }

            await ctx.reply(
                `Tip set to ${Big(ctx.user.tip).mul(100).toFixed()} %`,
            )
        })
    })
}
