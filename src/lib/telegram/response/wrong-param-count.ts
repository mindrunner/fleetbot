import { Message } from 'telegraf/types'

import { ContextMessageUpdate } from '../context-message-update'

import TextMessage = Message.TextMessage

export const wrongParamCount = (ctx: ContextMessageUpdate, message: string): Promise<TextMessage> => ctx.reply(message)
