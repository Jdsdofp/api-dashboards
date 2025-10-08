// src/services/analyticsService.ts
import { pool } from '../db/mysql';

export const getCertificatesByStatus = async () => {
  const [rows] = await pool.query(`
    SELECT certificate_status_name AS status, COUNT(*) AS total
    FROM mat_view_prod.predictive_certificate_analysis
    GROUP BY certificate_status_name;
  `);
  return rows;
};

export const getExpiringCertificates = async () => {
  const [rows] = await pool.query(`
    SELECT company_name, certificate_code, expiration_date, days_until_expiration
    FROM mat_view_prod.predictive_certificate_analysis
    WHERE days_until_expiration BETWEEN 0 AND 30
    ORDER BY days_until_expiration ASC;
  `);
  return rows;
};
