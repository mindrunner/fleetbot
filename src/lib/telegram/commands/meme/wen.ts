import { Telegraf } from 'telegraf'

import { logger } from '../../../../logger.js'
import { ContextMessageUpdate } from '../../context-message-update.js'

export const wen = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['wen'], async (ctx) => {
        await ctx.persistentChatAction('upload_photo', async () => {
            try {
                await ctx.replyWithAnimation(
                    'http://2damnfunny.com/wp-content/uploads/2013/06/Very-Thoon-Husky-Dog-Meme-Gif.gif',
                )
            } catch (e: any) {
                logger.error(`Cannot send Photo: ${e.message}`)
                await ctx.reply('Thoon!')
            }
        })
    })
}
