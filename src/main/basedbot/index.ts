import { Sentry } from '../../sentry' // import this as early as possible to catch early startup errors

import { logger } from '../../logger'

import * as app from './basedbot'

const stop = async (signal?: NodeJS.Signals) => {
    logger.info(`Shutting down${signal ? ` (${signal})` : ''}`)

    try {
        await app.stop()
    }
    catch (error) {
        Sentry.captureException(error)
        logger.error('Close failed')
        logger.error((error as Error).stack)

        process.exitCode = 1
    }
    process.exit()
}

const start = async () => {
    try {
        await app.create()
        await app.start()
    }
    catch (error) {
        Sentry.captureException(error)
        logger.error((error as Error).stack)

        process.exitCode = 1
        await stop()
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
process.on('unhandledRejection', async (reason: any | null | undefined, _promise: Promise<any>) => {
    logger.error('Unhandled rejection')

    if (reason) {
        const { message }: { message: string } = reason

        if (message.includes('Event listener')) {
            return
        }
        logger.error(message)
    }

    Sentry.captureException(reason)
    await stop()
})

process.on('uncaughtException', async (error) => {
    Sentry.captureException(error)
    logger.error('Uncaught exception')
    logger.error(error.stack)

    await stop()
})

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

start()
