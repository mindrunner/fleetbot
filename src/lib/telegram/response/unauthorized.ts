import { Message } from 'telegraf/types'

import { ContextMessageUpdate } from '../context-message-update.js'

export const unauthorized = (
    ctx: ContextMessageUpdate,
): Promise<Message.TextMessage> =>
    ctx.reply(`
Huh, who are you? Please authorize first!
`)
