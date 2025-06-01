import { faker } from '@faker-js/faker'
import { Telegraf } from 'telegraf'

import { logger } from '../../../../logger.js'
import { ContextMessageUpdate } from '../../context-message-update.js'

export const kitten = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['kitten'], async (ctx) => {
        await ctx.persistentChatAction('upload_photo', async () => {
            const x = faker.number.int({ min: 128, max: 2048 })

            try {
                await ctx.replyWithPhoto(`https://placekitten.com/${x}/${x}`)
            } catch (e: any) {
                logger.error(`Cannot send Photo: ${e.message}`)
                await ctx.reply('Meow!')
            }
        })
    })
}
