// src/routes/devices.ts
import { Router } from 'express';
import * as deviceController from '../controllers/deviceManagementController';

const router = Router();

// =====================================
// 📍 GPS & POSITIONING ROUTES
// =====================================
router.get('/:companyId/position/:devEui', deviceController.getCurrentPosition);
router.get('/:companyId/route/:devEui', deviceController.getDeviceRoute);
router.get('/:companyId/motion-state', deviceController.getMotionState);
router.get('/:companyId/low-battery', deviceController.getLowBattery);
router.get('/:companyId/offline', deviceController.getOfflineDevices);
router.get('/:companyId/gateway-quality', deviceController.getGatewayQuality);
router.get('/:companyId/customer-stats', deviceController.getCustomerStats);

// =====================================
// 🚨 EVENT & ALERT ROUTES
// =====================================
router.get('/:companyId/sos/active', deviceController.getActiveSOS);
router.get('/:companyId/sos/events', deviceController.getSOSEvents);
router.get('/:companyId/motion/transitions', deviceController.getMotionTransitions);
router.get('/events/duplicates', deviceController.getDuplicateEvents);
router.get('/:companyId/events/types', deviceController.getEventTypes);
router.get('/geofence/violations', deviceController.getGeofenceAlerts);

// =====================================
// ⚙️ CONFIGURATION ROUTES
// =====================================
router.get('/config/:devEui', deviceController.getDeviceConfig);
router.get('/config/:devEui/history', deviceController.getConfigHistory);
// router.get('/tracking-modes', deviceController.getTrackingModes);

// =====================================
// 📊 KPI ROUTES
// =====================================
router.get('/:companyId/kpi/uptime', deviceController.getDeviceUptimeKPI);
router.get('/kpi/gps-success', deviceController.getGPSSuccessKPI);
router.get('/:companyId/kpi/battery-health', deviceController.getBatteryHealthKPI);
router.get('/:companyId/kpi/accuracy', deviceController.getAccuracyDistributionKPI);

// =====================================
// 🎯 DASHBOARD AGGREGATED ROUTE
// =====================================
router.get('/:companyId/dashboard/overview', deviceController.getDashboardOverview);

// =====================================
// 🗄️ RAW DATA ROUTES
// =====================================
router.get('/:companyId/raw/gps-reports', deviceController.getRawGPSReports);
router.get('/:companyId/raw/events', deviceController.getRawEvents);
router.get('/:companyId/raw/scanning', deviceController.getRawScanningMonitoring);
router.get('/:companyId/raw/configuration', deviceController.getRawConfigurationManagement);
router.get('/:companyId/raw/gps-errors', deviceController.getRawGPSErrorManagement);

// =====================================
// 📥 EXPORT ROUTES
// =====================================
router.get('/export/:companyId/:table/:format', deviceController.exportTableData);

// Rota para heartbeats

// # Buscar todos os heartbeats (paginado)
// GET /api/heartbeats/raw?page=1&limit=50

// # Filtrar por dev_eui
// GET /api/heartbeats/raw?dev_eui=ABC123&page=1&limit=50

// # Filtrar por cliente
// GET /api/heartbeats/raw?customer_name=Cliente%20XYZ

// # Filtrar por período
// GET /api/heartbeats/raw?start_date=2025-01-01&end_date=2025-01-31

// # Ordenar por coluna específica
// GET /api/heartbeats/raw?sortBy=dev_eui&sortOrder=ASC

// # Filtros combinados
// GET /api/heartbeats/raw?dev_eui=ABC123&start_date=2025-01-01&sortBy=received_at&sortOrder=DESC&page=1&limit=100



router.get('/:companyId/heartbeats/raw', deviceController.getRawHeartbeats);


// Rota para scanned beacons
router.get('/:companyId/scanned-beacons/raw', deviceController.getRawScannedBeacons);

// 🆕 Nova rota para GPS Route
router.get('/:companyId/gps-route/raw', deviceController.getRawGPSRoute);

// Buscar dados GPS com filtros
router.get('/:companyId/gps-data', deviceController.getGPSData);

// Obter estatísticas
router.get('/:companyId/gps-stats', deviceController.getGPSStats);

router.get('/:companyId/device/list', deviceController.getDeviceList);


export default router;