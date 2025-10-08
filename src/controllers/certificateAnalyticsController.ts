// src/controllers/certificateAnalyticsController.ts
import { Request, Response } from 'express';
import { getCertificateAnalyticsByCompany } from '../services/certificateAnalyticsService';

export const fetchCertificateAnalytics = async (req: Request, res: Response) => {
  try {
    const companyId = parseInt(req.params.companyId);

    // Validação do parâmetro
    if (isNaN(companyId) || companyId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid company ID',
        message: 'Company ID must be a positive number'
      });
    }

    const analytics = await getCertificateAnalyticsByCompany(companyId);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching certificate analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch certificate analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
