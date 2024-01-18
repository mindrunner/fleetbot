import { Sentry } from '../../sentry'

import { logger } from '../../logger'

import { connection } from './const'

const sleep = (ms: number) =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })

export const finalize = async (sig: string): Promise<void> => {
    let finalized = false
    let attempts = 0

    do {
        // eslint-disable-next-line no-await-in-loop
        await sleep(5000)

        // eslint-disable-next-line no-await-in-loop
        const status = await connection.getSignatureStatus(sig)

        if (status?.value?.confirmationStatus === 'finalized') {
            finalized = true
        }
        else {
            logger.info(
                `(${++attempts}) Waiting for finalization: ${status.value
                    ?.confirmations}`,
            )
        }
    } while (!finalized && attempts < 25)
    if(finalized) {
        logger.info(`finalized ${sig}`)
    }
    else {
        const message = `could not finalize ${sig}`

        logger.warn(message)
        Sentry.captureMessage(message)
    }
}
