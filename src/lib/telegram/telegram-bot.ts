import { Telegraf } from 'telegraf'

import { config } from '../../config/index.js'

import * as commands from './commands/index.js'
import { ContextMessageUpdate } from './context-message-update.js'
import { auth } from './middleware/index.js'
import { params } from './middleware/params.js'

const telegramBot: Telegraf<ContextMessageUpdate> = new Telegraf(
    config.bot.telegramToken,
    { handlerTimeout: 360_000 },
)

telegramBot.use(auth)
telegramBot.use(params)

for (const command of Object.values(commands)) {
    command(telegramBot)
}

process.once('SIGINT', () => telegramBot.stop('SIGINT'))
process.once('SIGTERM', () => telegramBot.stop('SIGTERM'))

export { telegramBot }
