import { DataSource } from 'typeorm'

import dbConfig from './db-config.js'

export default new DataSource(dbConfig)
