import { Telegraf } from 'telegraf'

import { Transaction } from '../../../db/entities'
import { AD } from '../../../service/sol'
import { ContextMessageUpdate } from '../context-message-update'
import { unauthorized } from '../response'

export const transactions = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['transactions'], async (ctx: ContextMessageUpdate) => {
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

            await ctx.reply(`Showing the last ${take} transactions`)
            const userTransactions = await Transaction.find({
                where: { walletPublicKey: ctx.user.publicKey },
                take,
                order: { time: 'DESC' },
            })

            for (const transaction of userTransactions) {
                await ctx.replyWithHTML(`
<b>Signature:</b>  <a href="https://solscan.io/tx/${transaction.signature}">click</a>
<b>Time:</b> ${transaction.time.toLocaleDateString()} ${transaction.time.toLocaleTimeString()}
<b>Amount:</b> ${transaction.amount.toFixed(AD)} ATLAS`)
            }
        })
    })
}
