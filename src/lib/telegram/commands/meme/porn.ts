import { Telegraf } from 'telegraf'

import { ShipInfo } from '../../../../db/entities'
import { logger } from '../../../../logger'
import { ContextMessageUpdate } from '../../context-message-update'

export const porn = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['porn'], async (ctx) => {
        await ctx.persistentChatAction('upload_photo', async () => {
            try {
                const randomShip = await ShipInfo.getRepository()
                    .createQueryBuilder('ship_info')
                    .select()
                    .orderBy('RANDOM()')
                    .getOne()

                const imageName = randomShip?.imageName || ''
                const imageUrl = `https://storage.googleapis.com/nft-assets/items/${imageName}.jpg`

                await ctx.replyWithPhoto(imageUrl)
            } catch (e: any) {
                logger.error(`Cannot send Photo: ${e.message}`)
                await ctx.reply(':-*')
            }
        })
    })
}
