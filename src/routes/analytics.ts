// src/routes/analytics.ts
import { Router } from 'express';
import { fetchCertificateAnalytics } from '../controllers/certificateAnalyticsController';

const router = Router();
router.get('/certificates/company', fetchCertificateAnalytics);
export default router;
