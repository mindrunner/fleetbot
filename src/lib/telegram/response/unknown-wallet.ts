import { Message } from 'telegraf/types'

import { ContextMessageUpdate } from '../context-message-update'

export const unknownWallet = (
    ctx: ContextMessageUpdate,
): Promise<Message.TextMessage> =>
    ctx.reply(`
Could not find wallet. Please send some ATLAS first!
`)
