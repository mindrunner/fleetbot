import { DataSource } from 'typeorm'
import dbConfig from '../../db/db-config'

const dataSource = new DataSource(dbConfig)

await dataSource.initialize()
await dataSource.runMigrations()
await dataSource.destroy()
