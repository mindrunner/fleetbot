import { Telegraf } from 'telegraf'

import { config } from '../../config'

import * as commands from './commands'
import { ContextMessageUpdate } from './context-message-update'
import { auth } from './middleware'
import { params } from './middleware/params'

const telegramBot: Telegraf<ContextMessageUpdate> = new Telegraf(config.bot.telegramToken, { handlerTimeout: 360_000 })

telegramBot.use(auth)
telegramBot.use(params)

for (const command of Object.values(commands)) {
    command(telegramBot)
}

process.once('SIGINT', () => telegramBot.stop('SIGINT'))
process.once('SIGTERM', () => telegramBot.stop('SIGTERM'))

export { telegramBot }
