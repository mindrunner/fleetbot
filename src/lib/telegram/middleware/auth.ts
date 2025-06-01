import { Middleware } from 'telegraf'
import { Wallet } from '../../../db/entities/wallet.js'

import { ContextMessageUpdate } from '../context-message-update.js'

export const auth: Middleware<ContextMessageUpdate> = async (
    ctx: ContextMessageUpdate,
    next: any,
) => {
    if (ctx.from?.id) {
        const wallet = await Wallet.findOneBy({ telegramId: ctx.from.id })

        ctx.authed = wallet?.authed || false
        ctx.user = wallet
    }

    await next()
}
