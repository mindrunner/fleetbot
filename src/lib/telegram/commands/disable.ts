import { Telegraf } from 'telegraf'

import { ContextMessageUpdate } from '../context-message-update'
import { unauthorized } from '../response'

export const disable = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['disable'], async (ctx) => {
        if (!ctx.user || !ctx.authed) {
            await unauthorized(ctx)

            return
        }

        ctx.user.enabled = false
        await ctx.user.save()
        await ctx.reply('Refilling is disabled!')
    })
}
