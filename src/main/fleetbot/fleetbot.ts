import { CronJob } from 'cron'

import { config } from '../../config'
import * as db from '../../db'
import { checkTransactions, refill, stockResources, telegramBot } from '../../lib'
import { logger } from '../../logger'

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
    }
    catch (e) {
        logger.error(e)
    }
}

export const start = async (): Promise<void> => {
    // https://github.com/telegraf/telegraf/issues/1749
    telegramBot.launch()
    if (config.app.quickstart) {
        await stockResources()
        await checkTransactions()
        await refill()
    }
    resourcesCronJob = new CronJob(config.cron.resourceInterval, stockResources, null, true)
    refillCronJob = new CronJob(config.cron.refillInterval, refill, null, true)
    transactionCronJob = new CronJob(config.cron.bookkeeperInterval, checkTransactions, null, true)
}
