import { Message } from 'typegram'

import { ContextMessageUpdate } from '../context-message-update'

import TextMessage = Message.TextMessage

export const unknownWallet = (ctx: ContextMessageUpdate): Promise<TextMessage> => ctx.reply(`
Could not find wallet. Please send some ATLAS first!
`)
