import { CronJob } from 'cron'

import { config } from '../../config/index.js'
import * as db from '../../db/index.js'
import {
    checkTransactions,
    refill,
    stockResources,
    telegramBot,
} from '../../lib/index.js'
import { logger } from '../../logger.js'
import { initOrderBook } from '../../service/gm/index.js'

let refillCronJob: CronJob | undefined,
    resourcesCronJob: CronJob | undefined,
    transactionCronJob: CronJob | undefined

export const create = async (): Promise<void> => {
    logger.info('Starting fleetbot...')
    await db.connect()
}

export const stop = async (): Promise<void> => {
    try {
        logger.info('Stopping fleetbot...')
        if (resourcesCronJob) {
            resourcesCronJob.stop()
        }
        if (transactionCronJob) {
            transactionCronJob.stop()
        }
        if (refillCronJob) {
            refillCronJob.stop()
        }
        await db.close()
    } catch (e) {
        logger.error(e)
    }
}

export const start = async (): Promise<void> => {
    await initOrderBook()
    // https://github.com/telegraf/telegraf/issues/1749
    telegramBot.launch().catch((e) => logger.error(e))

    resourcesCronJob = CronJob.from({
        cronTime: config.cron.resourceInterval,
        onTick: stockResources,
        runOnInit: config.app.quickstart,
        start: true,
    })
    refillCronJob = CronJob.from({
        cronTime: config.cron.refillInterval,
        onTick: refill,
        runOnInit: config.app.quickstart,
        start: true,
    })
    transactionCronJob = CronJob.from({
        cronTime: config.cron.bookkeeperInterval,
        onTick: checkTransactions,
        runOnInit: config.app.quickstart,
        start: true,
    })
}
