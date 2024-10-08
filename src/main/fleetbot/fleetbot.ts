import { CronJob } from 'cron'

import { config } from '../../config'
import * as db from '../../db'
import {
    checkTransactions,
    refill,
    stockResources,
    telegramBot,
} from '../../lib'
import { logger } from '../../logger'
import { initOrderBook } from '../../service/gm'

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
    // eslint-disable-next-line promise/prefer-await-to-then
    telegramBot.launch().catch((e) => logger.error(e))

    if (config.app.quickstart) {
        await stockResources()
        await checkTransactions()
        await refill()
    }
    resourcesCronJob = CronJob.from({
        cronTime: config.cron.resourceInterval,
        onTick: stockResources,
        start: true,
    })
    refillCronJob = CronJob.from({
        cronTime: config.cron.refillInterval,
        onTick: refill,
        start: true,
    })
    transactionCronJob = CronJob.from({
        cronTime: config.cron.bookkeeperInterval,
        onTick: checkTransactions,
        start: true,
    })
}
