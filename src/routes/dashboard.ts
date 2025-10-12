// src/routes/dashboard.ts
import { Router } from 'express';
import { fetchCertificateStatus, fetchTopBrands } from '../controllers/dashboardController';
import { fetchCertificateAnalytics, reportsCertificateAnalytics } from '../controllers/certificateAnalyticsController';
import { geoLocationMetrics } from '../controllers/geoLocationsMetricsContoller';

// 🆕 Importar rotas de dispositivos
import deviceRoutes from './devices';


const router = Router();

// ====== Rotas de certificados ======
router.get('/certificates/status', fetchCertificateStatus);
router.get('/certificates/top-brands', fetchTopBrands);
router.get('/certificates/:companyId', fetchCertificateAnalytics);
router.get('/certificates/reports/:companyId', reportsCertificateAnalytics);

// ====== Rotas de métricas geográficas ======
router.get('/metrics/:companyId', geoLocationMetrics); // ✅ usa o controller que chama o service

// ====== 🆕 Rotas de dispositivos IoT ======
router.use('/devices', deviceRoutes);

//Minhas rotas necessarias

export default router;
