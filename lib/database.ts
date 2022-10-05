import { DataSource, DataSourceOptions } from 'typeorm';

const DATASOURCE_OPTIONS: DataSourceOptions = {
  type: 'mysql',
  host: process.env.ZEITHROLD_MYSQL_HOST,
  username: process.env.ZEITHROLD_MYSQL_USERNAME,
  password: process.env.ZEITHROLD_MYSQL_PASSWORD,
  port: process.env.ZEITHROLD_MYSQL_PORT
    ? parseInt(process.env.ZEITHROLD_MYSQL_PORT)
    : 3306,
  database: process.env.ZEITHROLD_MYSQL_DATABASE,
};

let AppDataSource = new DataSource(DATASOURCE_OPTIONS);
export { AppDataSource };
