import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { DataSourceOptions, LoggerOptions } from 'typeorm'
import { config } from '../config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbConfig: DataSourceOptions = {
    ...config.db,
    type: 'postgres',
    synchronize: false,
    entities: [join(__dirname, 'entities/**/!(*test).{ts,js}')],
    migrations: [join(__dirname, 'migrations/**/*.{ts,js}')],
    logging: ((config.db.logging || 'all') as string)
        .split(',')
        .map((l) => l.trim()) as LoggerOptions,
}

export default dbConfig
