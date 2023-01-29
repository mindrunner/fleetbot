import { Message } from 'typegram'

import { ContextMessageUpdate } from '../context-message-update'

import TextMessage = Message.TextMessage

export const alreadyRegistered = (ctx: ContextMessageUpdate): Promise<TextMessage> => ctx.reply(`
Looks like you are already registered and ready to go!
`)
