// src/controllers/certificateAnalyticsController.ts
import { Request, Response } from 'express';
import { getCertificateAnalyticsByCompany, getReportsCertificateAnalyticsByCompany } from '../services/certificateAnalyticsService';

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



export const reportsCertificateAnalytics = async (req: Request, res: Response) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    // Validação do companyId
    if (isNaN(companyId) || companyId <= 0) {
      return res.status(400).json({
        error: 'Invalid company ID',
        message: 'Company ID must be a positive number'
      });
    }

    // Obter parâmetros de paginação da query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'action_priority';
    const sortOrder = ((req.query.sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';

    // Validações adicionais
    if (page < 1) {
      return res.status(400).json({
        error: 'Invalid page number',
        message: 'Page must be greater than 0'
      });
    }

    if (limit < 1 || limit > 999999) { // Aumentar de 100 para 999999
      return res.status(400).json({
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 999999'
      });
    }

    const result = await getReportsCertificateAnalyticsByCompany(companyId, {
      page,
      limit,
      sortBy,
      sortOrder
    });

    return res.json(result);
  } catch (error) {
    console.error('Error fetching certificate analytics for reports:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch certificate analytics for reports',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};