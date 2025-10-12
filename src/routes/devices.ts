// src/routes/devices.ts
import { Router } from 'express';
import * as deviceController from '../controllers/deviceManagementController';

const router = Router();

// =====================================
// 📍 GPS & POSITIONING ROUTES
// =====================================
router.get('/position/:devEui', deviceController.getCurrentPosition);
router.get('/route/:devEui', deviceController.getDeviceRoute);
router.get('/motion-state', deviceController.getMotionState);
router.get('/low-battery', deviceController.getLowBattery);
router.get('/offline', deviceController.getOfflineDevices);
router.get('/gateway-quality', deviceController.getGatewayQuality);
router.get('/customer-stats', deviceController.getCustomerStats);

// =====================================
// 🚨 EVENT & ALERT ROUTES
// =====================================
router.get('/sos/active', deviceController.getActiveSOS);
router.get('/sos/events', deviceController.getSOSEvents);
router.get('/motion/transitions', deviceController.getMotionTransitions);
router.get('/events/duplicates', deviceController.getDuplicateEvents);
router.get('/events/types', deviceController.getEventTypes);
router.get('/geofence/violations', deviceController.getGeofenceAlerts);

// =====================================
// ⚙️ CONFIGURATION ROUTES
// =====================================
router.get('/config/:devEui', deviceController.getDeviceConfig);
router.get('/config/:devEui/history', deviceController.getConfigHistory);
router.get('/tracking-modes', deviceController.getTrackingModes);

// =====================================
// 📊 KPI ROUTES
// =====================================
router.get('/kpi/uptime', deviceController.getDeviceUptimeKPI);
router.get('/kpi/gps-success', deviceController.getGPSSuccessKPI);
router.get('/kpi/battery-health', deviceController.getBatteryHealthKPI);
router.get('/kpi/accuracy', deviceController.getAccuracyDistributionKPI);

// =====================================
// 🎯 DASHBOARD AGGREGATED ROUTE
// =====================================
router.get('/dashboard/overview', deviceController.getDashboardOverview);

// =====================================
// 🗄️ RAW DATA ROUTES
// =====================================
router.get('/raw/gps-reports', deviceController.getRawGPSReports);
router.get('/raw/events', deviceController.getRawEvents);
router.get('/raw/scanning', deviceController.getRawScanningMonitoring);
router.get('/raw/configuration', deviceController.getRawConfigurationManagement);
router.get('/raw/gps-errors', deviceController.getRawGPSErrorManagement);

// =====================================
// 📥 EXPORT ROUTES
// =====================================
router.get('/export/:table/:format', deviceController.exportTableData);

export default router;