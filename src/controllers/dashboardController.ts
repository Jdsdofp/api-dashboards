// src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';

export const fetchCertificateStatus = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getCertificateStatus();
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
};

export const fetchTopBrands = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getTopBrands();
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
};
