import { Telegraf } from 'telegraf'

import { Wallet } from '../../../db/entities/index.js'
import { ContextMessageUpdate } from '../context-message-update.js'
import { unauthorized } from '../response/index.js'

export const logout = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['logout'], async (ctx) => {
        await ctx.persistentChatAction('typing', async () => {
            if (!ctx.user || !ctx.authed) {
                await unauthorized(ctx)

                return
            }

            if (ctx.user.enabled) {
                await ctx.reply(
                    'Your wallet is currently enabled, toggle with /disable command',
                )

                return
            }

            ctx.user.authed = false
            ctx.user.telegramId = null
            ctx.user.authTxAmount = null
            ctx.user.authExpire = null

            await Wallet.save(ctx.user)

            ctx.reply('Logged out successfully')
        })
    })
}
