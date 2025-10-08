// src/controllers/analyticsController.ts
import { Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';

export const getStatusSummary = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getCertificatesByStatus();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
};
