import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DataSourceOptions, LoggerOptions } from 'typeorm'
import { config } from '../config/index.js'
import { Bonus } from './entities/bonus.js'
import { Refill } from './entities/refill.js'
import { Transaction } from './entities/transaction.js'
import { TxCache } from './entities/tx-cache.js'
import { Wallet } from './entities/wallet.js'
import { ShipInfo } from './entities/ship-info.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbConfig: DataSourceOptions = {
    ...config.db,
    type: 'postgres',
    synchronize: false,
    entities: [Wallet, Transaction, Bonus, Refill, ShipInfo, TxCache],
    migrations: [join(__dirname, 'migrations/**/*.{ts,js}')],
    logging: ((config.db.logging || 'all') as string)
        .split(',')
        .map((l) => l.trim()) as LoggerOptions,
}

export default dbConfig
