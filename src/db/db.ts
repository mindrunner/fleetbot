import { DataSource } from 'typeorm'
import { LoggerOptions } from 'typeorm'

import { config } from '../config/index.js'
import { logger } from '../logger.js'

import dbConfig from './db-config.js'

export let dataSource: DataSource

export const connect = async (logging?: LoggerOptions): Promise<DataSource> => {
    logger.info(`Attempting db connection for ${config.db.database}`)

    dataSource = new DataSource({
        ...dbConfig,
        logging: logging || dbConfig.logging,
    })

    await dataSource.initialize()

    logger.info(`Database connected at ${config.db.host}`)

    return dataSource
}

export const close = async (): Promise<void> => {
    if (dataSource && dataSource.isInitialized) {
        logger.info(`Disconnecting database at ${config.db.host}`)

        await dataSource.destroy()
    }
}
