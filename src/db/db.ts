import { DataSource } from 'typeorm'
import { LoggerOptions } from 'typeorm/logger/LoggerOptions'

import { config } from '../config'
import { logger } from '../logger'

import dbConfig from './db-config'

export let dataSource: DataSource

export const connect = async (logging?: LoggerOptions): Promise<DataSource> => {
    logger.info(`Attempting db connection for ${config.db.database}`)

    dataSource = new DataSource({ ...dbConfig, logging: logging || dbConfig.logging })

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
