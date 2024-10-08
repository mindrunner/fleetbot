import { Telegraf } from 'telegraf'

import { Refill } from '../../../db/entities'
import { AD } from '../../../service/sol'
import { ContextMessageUpdate } from '../context-message-update'
import { unauthorized } from '../response'

export const refills = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['refills'], async (ctx: ContextMessageUpdate) => {
        await ctx.persistentChatAction('typing', async () => {
            if (!ctx.user || !ctx.authed) {
                await unauthorized(ctx)

                return
            }

            if (!ctx.user.enabled) {
                await ctx.reply(
                    'Your wallet is currently disabled, toggle with /enable command',
                )

                return
            }

            const take = 10

            await ctx.reply(`Showing the last ${take} refills`)
            const userRefills = await Refill.find({
                where: { walletPublicKey: ctx.user.publicKey },
                take,
                order: { time: 'DESC' },
            })

            for (const refill of userRefills) {
                // eslint-disable-next-line no-await-in-loop
                await ctx.replyWithHTML(`
<b>Signature:</b>  <a href="https://solscan.io/tx/${refill.signature}">click</a>
<b>Time:</b> ${refill.time.toLocaleDateString()} ${refill.time.toLocaleTimeString()}
<b>Fleet:</b> ${refill.fleet}
<b>Food:</b> ${refill.food}
<b>Tool:</b> ${refill.tool}
<b>Fuel:</b> ${refill.fuel}
<b>Ammo</b> ${refill.ammo}
<b>Price:</b> ${refill.price.toFixed(AD)} ATLAS`)
            }
        })
    })
}
