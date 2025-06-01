import { Telegraf } from 'telegraf'

import { ContextMessageUpdate } from '../context-message-update.js'
import { unauthorized } from '../response/index.js'

export const disableNotify = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['disable-notify'], async (ctx) => {
        await ctx.persistentChatAction('typing', async () => {
            if (!ctx.user || !ctx.authed) {
                await unauthorized(ctx)

                return
            }

            ctx.user.notify = false
            await ctx.user.save()
            await ctx.reply(
                'I will stay silent unless there is something urgent happening.',
            )
        })
    })
}
