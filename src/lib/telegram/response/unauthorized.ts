import { Message } from 'typegram'

import { ContextMessageUpdate } from '../context-message-update'

import TextMessage = Message.TextMessage

export const unauthorized = (ctx: ContextMessageUpdate): Promise<TextMessage> => ctx.reply(`
Huh, who are you? Please authorize first!
`)
