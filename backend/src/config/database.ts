import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD;

if (!dbHost || !dbName || !dbUser || dbPassword === undefined) {
  throw new Error('Database configuration is incomplete. Please check your .env file.');
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL queries in development
});

export default sequelize;
