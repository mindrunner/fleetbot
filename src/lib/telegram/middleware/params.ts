import { Middleware } from 'telegraf'

import { ContextMessageUpdate } from '../context-message-update.js'

export const params: Middleware<ContextMessageUpdate> = (
    ctx: ContextMessageUpdate,
    next: any,
) => {
    if (ctx.message && 'text' in ctx.message) {
        ctx.params = ctx.message.text.split(' ').splice(1)
    }

    return next()
}
