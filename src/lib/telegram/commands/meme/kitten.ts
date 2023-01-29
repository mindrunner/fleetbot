import { faker } from '@faker-js/faker'
import { Telegraf } from 'telegraf'

import { ContextMessageUpdate } from '../../context-message-update'

export const kitten = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['kitten'], async (ctx) => {
        const x = faker.datatype.number({ min: 128, max: 2048 })

        try {
            await ctx.replyWithPhoto({
                url: `https://placekitten.com/${x}/${x}`,
                filename: 'kitten.jpg'
            })
        }
        catch {
            ctx.reply('Meow!')
        }
    })
}
