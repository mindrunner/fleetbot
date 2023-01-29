import { DataSourceOptions } from 'typeorm'
import { LoggerOptions } from 'typeorm/logger/LoggerOptions'

import { config } from '../config'

const dbConfig: DataSourceOptions = {
    ...config.db,
    type: 'postgres',
    synchronize: false,
    entities: [`${__dirname}/entities/**/!(*test).{ts,js}`],
    migrations: [`${__dirname}/migrations/**/*.{ts,js}`],
    logging: ((config.db.logging || 'all') as string).split(',').map(l => l.trim()) as LoggerOptions
}

export default dbConfig
