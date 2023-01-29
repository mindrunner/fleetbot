import { Message } from 'typegram'

import dayjs from '../../../dayjs'
import { Wallet } from '../../../db/entities'
import { ContextMessageUpdate } from '../context-message-update'

import TextMessage = Message.TextMessage

export const authPending = (ctx: ContextMessageUpdate, wallet: Wallet): Promise<TextMessage> => {
    const authExpire = dayjs().diff(wallet.authExpire, 'second')

    return ctx.reply(`
Please send exactly ${wallet.authTxAmount} ATLAS to fleetbot.sol.
You have ${dayjs.duration(authExpire, 'seconds').humanize(false)} left!
`)
}
