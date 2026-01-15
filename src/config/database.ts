import { DataSource } from 'typeorm';
import { Product } from '../models/Product';
import { Movimentation } from '../models/Movimentation';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'almoxarifado',
  synchronize: false,
  logging: false,
  entities: [Product, Movimentation],
  migrations: [],
  subscribers: [],
});
