import { PublicKey } from '@solana/web3.js'
import { Telegraf } from 'telegraf'

import { AD } from '../../../service/sol'
import { refillPlayer } from '../../refill-player'
import {
    fullRefillStrategy,
    optimalRefillStrategy,
} from '../../refill-strategy'
import { ContextMessageUpdate } from '../context-message-update'
import { unauthorized } from '../response'

export const refill = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['refill'], async (ctx: ContextMessageUpdate) => {
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

            const strategy =
                ctx.params.length === 1 && ctx.params[0] === 'full'
                    ? fullRefillStrategy
                    : optimalRefillStrategy
            const strategyName =
                ctx.params.length === 1 && ctx.params[0] === 'full'
                    ? 'full'
                    : 'optimal'

            await ctx.reply(
                'Just saying... There should not be any reason to do this now, but as you wish, I am going to refill your fleets, ser!',
            )
            await ctx.reply(
                `Using ${strategyName} refill strategy. Give me a moment please...`,
            )
            const userRefills = await refillPlayer(
                new PublicKey(ctx.user.publicKey),
                strategy,
            )

            for (const userRefill of userRefills) {
                // eslint-disable-next-line no-await-in-loop
                await ctx.replyWithHTML(`
<b>Signature:</b>  <a href="https://solscan.io/tx/${userRefill.signature}">click</a>
<b>Time:</b> ${userRefill.time.toLocaleDateString()} ${userRefill.time.toLocaleTimeString()}
<b>Fleet:</b> ${userRefill.fleet}
<b>Food:</b> ${userRefill.food}
<b>Tool:</b> ${userRefill.tool}
<b>Fuel:</b> ${userRefill.fuel}
<b>Ammo</b> ${userRefill.ammo}
<b>Price:</b> ${userRefill.price.toFixed(AD)} ATLAS`)
            }

            if (strategyName === 'optimal') {
                await ctx.reply(
                    "Pro Tip: Trigger a full refill with '/refill full'",
                )
            }
        })
    })
}
