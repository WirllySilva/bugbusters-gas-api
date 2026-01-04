import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Alert } from '../modules/alerts/Alert'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'bugbusters_gas',
  synchronize: true,
  logging: false,
  entities: [Alert],
  migrations: [],
  subscribers: [],
})
