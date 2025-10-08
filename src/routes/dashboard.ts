// src/routes/dashboard.ts
import { Router } from 'express';
import { fetchCertificateStatus, fetchTopBrands } from '../controllers/dashboardController';
import { fetchCertificateAnalytics } from '../controllers/certificateAnalyticsController';

const router = Router();

router.get('/certificates/status', fetchCertificateStatus);
router.get('/certificates/top-brands', fetchTopBrands);
router.get('/certificates/:companyId', fetchCertificateAnalytics);

export default router;
