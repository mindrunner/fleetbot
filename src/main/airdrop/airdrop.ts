import { PublicKey } from '@solana/web3.js'
import { CronJob } from 'cron'

import { config } from '../../config'
import { airdrop } from '../../lib/airdrop'
import { logger } from '../../logger'

let airdropCronJob: CronJob | undefined

export const create = async (): Promise<void> => {
    logger.info('Starting airdrop...')
}

export const stop = async (): Promise<void> => {
    try {
        logger.info('Stopping airdrop...')
        if (airdropCronJob) {
            airdropCronJob.stop()
        }
    } catch (e) {
        logger.error(e)
    }
}

const airdropTick = async (): Promise<void> => {
    await Promise.all(
        config.app.airdropWallets.map((w) =>
            airdrop(
                config.app.airdropUrl,
                config.app.airdropToken,
                new PublicKey(w),
            ),
        ),
    )
}

export const start = async (): Promise<void> => {
    if (config.app.quickstart) {
        await airdropTick()
    }
    airdropCronJob = CronJob.from({
        cronTime: config.cron.airdropInterval,
        onTick: airdropTick,
        start: true,
    })
}
