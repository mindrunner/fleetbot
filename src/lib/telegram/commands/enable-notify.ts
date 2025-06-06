import { Telegraf } from 'telegraf'

import { ContextMessageUpdate } from '../context-message-update.js'
import { unauthorized } from '../response/index.js'

export const enableNotify = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['enable-notify'], async (ctx) => {
        await ctx.persistentChatAction('typing', async () => {
            if (!ctx.user || !ctx.authed) {
                await unauthorized(ctx)

                return
            }

            ctx.user.notify = true
            await ctx.user.save()
            await ctx.reply('I will notify you after I refilled your fleets.')
        })
    })
}
