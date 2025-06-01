import { Message } from 'telegraf/types'

import { ContextMessageUpdate } from '../context-message-update.js'

export const wrongParamCount = (
    ctx: ContextMessageUpdate,
    message: string,
): Promise<Message.TextMessage> => ctx.reply(message)
