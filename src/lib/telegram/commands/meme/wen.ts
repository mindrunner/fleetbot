import { Telegraf } from 'telegraf'

import { ContextMessageUpdate } from '../../context-message-update'

export const wen = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['wen'], async (ctx) => {
        await ctx.persistentChatAction('upload_photo', async () => {
            try {
                await ctx.replyWithAnimation({
                    url: 'http://2damnfunny.com/wp-content/uploads/2013/06/Very-Thoon-Husky-Dog-Meme-Gif.gif',
                    filename: 'thoon.gif'
                })
            }
            catch {
                ctx.reply('Thoon!')
            }
        })
    })
}
