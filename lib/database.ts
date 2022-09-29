import { DataSource, DataSourceOptions } from "typeorm";

const DEV_DATASOURCE_OPTIONS: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  username: 'root',
  database: 'file_transfer'
}

const PROD_DATASOURCE_OPTIONS: DataSourceOptions = {
  type: 'mysql',
  host: process.env.ZEITHROLD_MYSQL_HOST,
  username: process.env.ZEITHROLD_MYSQL_USERNAME,
  password: process.env.ZEITHROLD_MYSQL_PASSWORD,
  port: process.env.ZEITHROLD_MYSQL_PORT ? parseInt(process.env.ZEITHROLD_MYSQL_PORT) : 3306,
  database: process.env.ZEITHROLD_MYSQL_DATABASE
}

export const AppDataSource = new DataSource(
  process.env.MODE === 'dev' ? DEV_DATASOURCE_OPTIONS : PROD_DATASOURCE_OPTIONS
)

