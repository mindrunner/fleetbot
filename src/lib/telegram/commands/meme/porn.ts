import { Telegraf } from 'telegraf'

import { ShipInfo } from '../../../../db/entities'
import { ContextMessageUpdate } from '../../context-message-update'

export const porn = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['porn'], async (ctx) => {
        try {
            const randomShip = await ShipInfo.getRepository()
                .createQueryBuilder('ship_info')
                .select()
                .orderBy('RANDOM()')
                .getOne()

            const imageName = randomShip?.imageName || ''

            await ctx.replyWithPhoto({
                url: `https://storage.googleapis.com/nft-assets/items/${imageName}.jpg`,
                filename: `${imageName}.jpg`
            })
        }
        catch {
            ctx.reply(':-*')
        }
    })
}
