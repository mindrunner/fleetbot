import { Telegraf } from 'telegraf'

import { ContextMessageUpdate } from '../context-message-update'
import { unauthorized } from '../response'

export const enable = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['enable'], async (ctx) => {
        await ctx.persistentChatAction('typing', async () => {
            if (!ctx.user || !ctx.authed) {
                await unauthorized(ctx)

                return
            }

            ctx.user.enabled = true
            await ctx.user.save()
            await ctx.reply('Refilling is enabled!')
        })
    })
}
