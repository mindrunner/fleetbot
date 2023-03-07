import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import { Telegraf } from 'telegraf'

import { Wallet } from '../../../db/entities'
import { ContextMessageUpdate } from '../context-message-update'
import { alreadyRegistered, authPending, unknownWallet, wrongParamCount } from '../response'

export const verify = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['verify'], async (ctx) => {
        await ctx.persistentChatAction('typing', async () => {
            if (ctx.user) {
                if (ctx.authed) {
                    await alreadyRegistered(ctx)

                    return
                }

                const telegramId = ctx.from.id
                const wallet = await Wallet.findOneBy({ telegramId })

                if (wallet && dayjs().isBefore(wallet.authExpire)) {
                    await authPending(ctx, wallet)

                    return
                }
            }

            if (ctx.params.length !== 1) {
                await wrongParamCount(ctx, 'Usage: /verify {publicKey}')

                return
            }
            const [publicKey] = ctx.params
            const wallet = await Wallet.findOneBy({ publicKey })

            if (!wallet) {
                await unknownWallet(ctx)

                return
            }

            ctx.reply('Alright! To verify this wallet belongs to you, I need you to send a small amount of ATLAS to me. Don\'t worry. I will add this to your balance of course.')
            wallet.telegramId = ctx.from.id
            wallet.authExpire = dayjs().add(1, 'hour').toDate()
            wallet.authTxAmount = faker.datatype.number({ min: 0.1, max: 0.999, precision: 0.001 })
            await wallet.save()
            await authPending(ctx, wallet)
            ctx.reply('This may take a moment. You can check the status with /verify command')
        })
    })
}
