import { DataSource } from 'typeorm';
import { Product } from '../models/Product';
import { Movimentation } from '../models/Movimentation';
import { AllowedUser } from '../models/AllowedUser';
import { StorageLocation } from '../models/StorageLocation';
import { Sector } from '../models/Sector';
import { ProductItem } from '../models/ProductItem';
import { config } from "./env"

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host || 'localhost',
  port: parseInt(config.database.port?.toString() || '5432'),
  username: config.database.user || 'postgres',
  password: config.database.password || 'postgres',
  database: config.database.name || 'almoxarifado',
  synchronize: false,
  logging: false,
  entities: [Product, Movimentation, AllowedUser, StorageLocation, Sector, ProductItem],
  migrations: [config.env === 'development' ? "src/migrations/**/*.ts" : "src/migrations/**/*.js"],
  subscribers: [],
});
