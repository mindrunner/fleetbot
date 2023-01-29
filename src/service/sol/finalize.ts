import { logger } from '../../logger'

import { connection } from './const'

// eslint-disable-next-line promise/avoid-new
const sleep = (ms: number) => new Promise((resolve) => {
    setTimeout(resolve, ms)
})

export const finalize = async (sig: string): Promise<void> => {
    let finalized = false

    do {
        // eslint-disable-next-line no-await-in-loop
        await sleep(5000)

        // eslint-disable-next-line no-await-in-loop
        const status = await connection.getSignatureStatus(sig)

        if (status?.value?.confirmationStatus === 'finalized') {
            finalized = true
        }
        else {
            logger.info(`Waiting for finalization: ${status.value?.confirmations}`)
        }
    } while (!finalized)
    logger.info(`finalized ${sig}`)
}
