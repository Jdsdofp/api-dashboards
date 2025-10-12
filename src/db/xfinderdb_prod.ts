// src/db/xfinderdb_prod.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const xfinderdb_prod = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME2,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
