import { Message } from 'telegraf/types'

import { ContextMessageUpdate } from '../context-message-update'

export const alreadyRegistered = (ctx: ContextMessageUpdate): Promise<Message.TextMessage> => ctx.reply(`
Looks like you are already registered and ready to go!
`)
