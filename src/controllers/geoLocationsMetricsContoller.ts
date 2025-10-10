// src/controllers/geoLocationMetricsController.ts
import { Request, Response } from 'express';
import { getGeoLocationMetrics } from '../services/geoLocationsMetricsService';

export const geoLocationMetrics = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const id = Number(companyId);


    console.log('Received companyId:', companyId);

    if (!companyId || isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid or missing companyId in request URL' });
    }

    const data = await getGeoLocationMetrics(id);
    if (!data) {
      return res.status(404).json({ message: 'No data found for this company' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching geolocation metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch geolocation metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

