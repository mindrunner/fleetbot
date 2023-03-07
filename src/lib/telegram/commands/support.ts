import { Telegraf } from 'telegraf'

import { config } from '../../../config'
import { ContextMessageUpdate } from '../context-message-update'

export const support = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['support'], async (ctx) => {
        await ctx.persistentChatAction('typing', async () => {
            await ctx.reply(`I really don't know why you would need that, but just in case you want to talk to a human, please contact ${config.bot.owner}`)
        })
    })
}
