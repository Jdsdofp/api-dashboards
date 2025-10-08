// src/services/dashboardService.ts
import { pool } from '../db/mysql';

export const getCertificateStatus = async () => {
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) as total FROM certificates GROUP BY status`
  );
  return rows;
};

export const getTopBrands = async () => {
  const [rows] = await pool.query(
    `SELECT brand, COUNT(*) as certificates FROM certificates GROUP BY brand ORDER BY certificates DESC LIMIT 5`
  );
  return rows;
};
