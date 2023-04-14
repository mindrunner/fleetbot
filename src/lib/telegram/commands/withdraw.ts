import { PublicKey } from '@solana/web3.js'
import Big from 'big.js'
import { Telegraf } from 'telegraf'

import dayjs from '../../../dayjs'
import { Transaction } from '../../../db/entities'
import { sendAtlas } from '../../../service/gm'
import { AD } from '../../../service/sol'
import { ContextMessageUpdate } from '../context-message-update'
import { unauthorized, wrongParamCount } from '../response'

export const withdraw = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['withdraw'], async (ctx) => {
        await ctx.persistentChatAction('typing', async () => {
            if (!ctx.user || !ctx.authed) {
                await unauthorized(ctx)

                return
            }

            if (ctx.params.length !== 1) {
                await wrongParamCount(ctx, 'Usage: /withdraw {amount}|all')

                return
            }

            const wallet = ctx.user
            const userBalance = await wallet.getBalance()
            const withdrawAmount = ctx.params[0] === 'all' ? userBalance : Big(ctx.params[0]).abs()

            if (withdrawAmount.gt(userBalance)) {
                await ctx.reply(`Amount ${withdrawAmount.toFixed(AD)} exceeds user balance ${userBalance.toFixed(AD)}`)

                return
            }

            await ctx.reply(`Sending ${withdrawAmount} ATLAS to ${ctx.user.publicKey}`)
            const signature = await sendAtlas(new PublicKey(ctx.user.publicKey), withdrawAmount.toNumber())

            await ctx.reply(`https://solscan.io/tx/${signature}`)
            const amount = -withdrawAmount

            await Transaction.create({ wallet, amount, signature, time: dayjs().toDate(), originalAmount: amount, resource: 'ATLAS' }).save()
        })
    })
}
