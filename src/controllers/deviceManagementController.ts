// src/controllers/deviceManagementController.ts
import { Request, Response } from 'express';
import * as deviceService from '../services/deviceManagementService';
import * as alertService from '../services/alertManagementService';



// types/gps.types.ts
export interface GPSFilters {
  dev_eui?: string | string[];
  start_date?: string;
  end_date?: string;
  valid_gps_only?: boolean;
  max_accuracy?: number;
  min_accuracy?: number;
}

export interface GPSDataParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  filters: GPSFilters;
  latestOnly?: boolean;
}

export interface GPSDataResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================
// 📍 GPS & POSITIONING ENDPOINTS
// =====================================

export const getCurrentPosition = async (req: Request, res: Response) => {
  try {
    const { devEui, companyId } = req.params;
    
    if (!devEui) {
      return res.status(400).json({ error: 'Missing devEui parameter' });
    }

    const data = await deviceService.getCurrentDevicePosition(devEui, companyId);
    
    if (!data) {
      return res.status(404).json({ message: 'Device not found or no position data available' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching current position:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device position',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDeviceRoute = async (req: Request, res: Response) => {
  try {
    const { devEui, companyId } = req.params;
    
    if (!devEui || !companyId) {
      return res.status(400).json({ error: 'Missing devEui or companyId parameter' });
    }

    const data = await deviceService.getDeviceRoute24h(devEui, companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching device route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device route',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMotionState = async (req: Request, res: Response) => {
  try {
        const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getDevicesByMotionState(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching motion states:', error);
    res.status(500).json({ 
      error: 'Failed to fetch motion states',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getLowBattery = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getLowBatteryDevices(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching low battery devices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch low battery devices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOfflineDevices = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getOfflineDevices(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching offline devices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch offline devices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getGatewayQuality = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getGatewaySignalQuality(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching gateway quality:', error);
    res.status(500).json({ 
      error: 'Failed to fetch gateway signal quality',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCustomerStats = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getCustomerActivity(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// =====================================
// 🚨 EVENT & ALERT ENDPOINTS
// =====================================

export const getActiveSOS = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getActiveSOSAlerts(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching active SOS alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch SOS alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSOSEvents = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getSOSEvents24h(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching SOS events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch SOS events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMotionTransitions = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getMotionToStaticToday(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching motion transitions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch motion transitions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDuplicateEvents = async (req: Request, res: Response) => {
  try {
    const data = await deviceService.getDuplicateEventRate();
    res.json(data);
  } catch (error) {
    console.error('Error fetching duplicate events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch duplicate event rates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getEventTypes = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getMostCommonEventTypes(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event type statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getGeofenceAlerts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await deviceService.getGeofenceViolations(limit);
    res.json(data);
  } catch (error) {
    console.error('Error fetching geofence violations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch geofence violations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// =====================================
// ⚙️ CONFIGURATION ENDPOINTS
// =====================================

export const getDeviceConfig = async (req: Request, res: Response) => {
  try {
    const { devEui, companyId } = req.params;
    
    if (!devEui || !companyId) {
      return res.status(400).json({ error: 'Missing devEui or companyID parameter' });
    }

    const data = await deviceService.getCurrentDeviceConfig(devEui, companyId);
    
    if (!data) {
      return res.status(404).json({ message: 'Device configuration not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching device config:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getConfigHistory = async (req: Request, res: Response) => {
  try {
    const { devEui } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    if (!devEui) {
      return res.status(400).json({ error: 'Missing devEui parameter' });
    }

    const data = await deviceService.getDeviceConfigHistory(devEui, limit);
    res.json(data);
  } catch (error) {
    console.error('Error fetching config history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch configuration history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTrackingModes = async (req: Request, res: Response) => {
  try {
    const data = await deviceService.getTrackingModeDistribution();
    res.json(data);
  } catch (error) {
    console.error('Error fetching tracking modes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tracking mode distribution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// =====================================
// 📊 KPI ENDPOINTS
// =====================================

export const getDeviceUptimeKPI = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getDeviceUptime(companyId);
    
    if (!data) {
      return res.status(404).json({ message: 'No uptime data available' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching device uptime:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device uptime KPI',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getGPSSuccessKPI = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getGPSSuccessRate(companyId);
    
    if (!data) {
      return res.status(404).json({ message: 'No GPS success rate data available' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching GPS success rate:', error);
    res.status(500).json({ 
      error: 'Failed to fetch GPS success rate KPI',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBatteryHealthKPI = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getBatteryHealthSummary(companyId);
    
    if (!data) {
      return res.status(404).json({ message: 'No battery health data available' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching battery health:', error);
    res.status(500).json({ 
      error: 'Failed to fetch battery health KPI',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAccuracyDistributionKPI = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const data = await deviceService.getPositionAccuracyDistribution(companyId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching accuracy distribution:', error);
    res.status(500).json({ 
      error: 'Failed to fetch position accuracy distribution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// =====================================
// 🎯 DASHBOARD AGGREGATED ENDPOINT
// =====================================

/**
 * Endpoint consolidado que retorna todos os KPIs principais de uma vez
 */
// export const getDashboardOverview = async (req: Request, res: Response) => {

//   try {

//     const { companyId } = req.params;
    
//     if (!companyId) {
//       return res.status(400).json({ error: 'Missing companyId parameter' });
//     }

//     const [
//       uptime,
//       gpsSuccess,
//       batteryHealth,
//       accuracyDist,
//       activeSOS,
//       lowBattery,
//       offline
//     ] = await Promise.all([
//       deviceService.getDeviceUptime(companyId),
//       deviceService.getGPSSuccessRate(companyId),
//       deviceService.getBatteryHealthSummary(companyId),
//       deviceService.getPositionAccuracyDistribution(companyId),
//       deviceService.getActiveSOSAlerts(companyId),
//       deviceService.getLowBatteryDevices(companyId),
//       deviceService.getOfflineDevices(companyId)
//     ]);

//     res.json({
//       kpis: {
//         uptime,
//         gps_success: gpsSuccess,
//         battery_health: batteryHealth,
//         accuracy_distribution: accuracyDist
//       },
//       alerts: {
//         active_sos_count: activeSOS.length,
//         active_sos_list: activeSOS,
//         low_battery_count: lowBattery.length,
//         low_battery_devices: lowBattery.slice(0, 10), // Top 10 críticos
//         offline_count: offline.length,
//         offline_devices: offline.slice(0, 10) // Top 10 offline há mais tempo
//       },
//       generated_at: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Error fetching dashboard overview:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch dashboard overview',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };


// =====================================
// 🗄️ RAW DATA ENDPOINTS
// =====================================



/**
 * 🆕 ENDPOINT CONSOLIDADO COMPLETO
 * Retorna todos os KPIs principais + Sistema de Alertas de uma vez
 */
export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
   
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    // 🔥 Executar todas as queries em paralelo para máxima performance
    const [
      // ===== KPIs Originais =====
      uptime,
      gpsSuccess,
      batteryHealth,
      accuracyDist,
      activeSOS,
      lowBattery,
      offline,
      
      // ===== 🆕 Sistema de Alertas =====
      alertSummary,
      activeAlerts,
      alertsByDepartment,
      alertsByZone,
      multipleAlerts,
      buttonComparison,
      alarmComparison
    ] = await Promise.all([
      // KPIs Originais
      deviceService.getDeviceUptime(companyId),
      deviceService.getGPSSuccessRate(companyId),
      deviceService.getBatteryHealthSummary(companyId),
      deviceService.getPositionAccuracyDistribution(companyId),
      deviceService.getActiveSOSAlerts(companyId),
      deviceService.getLowBatteryDevices(companyId),
      deviceService.getOfflineDevices(companyId),
      
      // Sistema de Alertas
      alertService.getAlertSummary(companyId),
      alertService.getAllActiveAlerts(companyId),
      alertService.getAlertsByDepartment(companyId),
      alertService.getAlertsByZone(companyId),
      alertService.getPeopleWithMultipleAlerts(companyId),
      alertService.getButtonComparison(companyId),
      alertService.getAlarmComparison(companyId)
    ]);

    // 🎯 Resposta consolidada
    res.json({
      // ===== KPIs de Dispositivos (Original) =====
      kpis: {
        uptime,
        gps_success: gpsSuccess,
        battery_health: batteryHealth,
        accuracy_distribution: accuracyDist
      },

      // ===== Alertas de Dispositivos (Original) =====
      device_alerts: {
        active_sos_count: activeSOS.length,
        active_sos_list: activeSOS,
        low_battery_count: lowBattery.length,
        low_battery_devices: lowBattery.slice(0, 10), // Top 10 críticos
        offline_count: offline.length,
        offline_devices: offline.slice(0, 10) // Top 10 offline há mais tempo
      },

      // ===== 🆕 Sistema de Alertas de Pessoas =====
      people_alerts: {
        // Resumo geral
        summary: alertSummary,
        
        // Alertas ativos (top 10 mais críticos)
        active_alerts: activeAlerts.slice(0, 10),
        active_alerts_count: activeAlerts.length,
        
        // Pessoas com múltiplos alertas (mais urgentes)
        multiple_alerts: multipleAlerts.slice(0, 5),
        
        // Distribuições para gráficos
        by_department: alertsByDepartment,
        by_zone: alertsByZone,
        
        // Comparativos para gráficos
        button_comparison: buttonComparison,
        alarm_comparison: alarmComparison
      },

      // ===== Meta informações =====
      generated_at: new Date().toISOString(),
      company_id: companyId
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard overview:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 🆕 ENDPOINT SIMPLIFICADO - Overview Rápido
 * Versão mais leve para atualizações frequentes
 */
export const getDashboardOverviewLight = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
   
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const [
      uptime,
      activeSOS,
      lowBattery,
      offline,
      alertSummary
    ] = await Promise.all([
      deviceService.getDeviceUptime(companyId),
      deviceService.getActiveSOSAlerts(companyId),
      deviceService.getLowBatteryDevices(companyId),
      deviceService.getOfflineDevices(companyId),
      alertService.getAlertSummary(companyId)
    ]);

    res.json({
      // Métricas essenciais
      summary: {
        devices_online: uptime.devices_online,
        devices_total: uptime.total_devices,
        uptime_percentage: uptime.uptime_percentage,
        
        // Alertas críticos
        critical_alerts: {
          sos_active: activeSOS.length,
          low_battery: lowBattery.length,
          offline: offline.length,
          
          // Alertas de pessoas
          highly_critical: alertSummary?.highly_critical || 0,
          critical: alertSummary?.critical || 0,
          total_people_alerts: alertSummary?.people_with_alerts || 0
        }
      },
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching light overview:', error);
    res.status(500).json({
      error: 'Failed to fetch light overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 🆕 ENDPOINT DETALHADO - Alertas Específicos de Pessoas
 * Para quando precisar de dados completos do sistema de alertas
 */
export const getPeopleAlertsDetailed = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
   
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    // Query params para filtros opcionais
    const {
      department,
      zone,
      priority,
      alarm1,
      alarm2,
      button1,
      button2,
      mandown
    } = req.query;

    // Construir filtros
    const filters: any = {};
    if (department) filters.department = department as string;
    if (zone) filters.zone = zone as string;
    if (priority) filters.priority = priority as 'HIGHLY_CRITICAL' | 'CRITICAL' | 'ALERT';
    if (alarm1 === 'true') filters.alarm1 = true;
    if (alarm2 === 'true') filters.alarm2 = true;
    if (button1 === 'true') filters.button1 = true;
    if (button2 === 'true') filters.button2 = true;
    if (mandown === 'true') filters.mandown = true;

    const [
      alertSummary,
      filteredAlerts,
      alertsByDepartment,
      alertsByZone,
      multipleAlerts,
      history24h
    ] = await Promise.all([
      alertService.getAlertSummary(companyId),
      alertService.getPeopleWithAlerts(companyId, filters),
      alertService.getAlertsByDepartment(companyId),
      alertService.getAlertsByZone(companyId),
      alertService.getPeopleWithMultipleAlerts(companyId),
      alertService.getAlertHistory24h(companyId)
    ]);

    res.json({
      summary: alertSummary,
      filtered_alerts: {
        data: filteredAlerts,
        count: filteredAlerts.length,
        filters_applied: filters
      },
      distributions: {
        by_department: alertsByDepartment,
        by_zone: alertsByZone
      },
      critical: {
        multiple_alerts: multipleAlerts,
        multiple_alerts_count: multipleAlerts.length
      },
      recent_changes: {
        last_24h: history24h.slice(0, 20), // Últimas 20 mudanças
        total_changes: history24h.length
      },
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching detailed people alerts:', error);
    res.status(500).json({
      error: 'Failed to fetch detailed people alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 🆕 ENDPOINT - Comparativos para Gráficos
 */
export const getAlertsComparison = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
   
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const [
      buttonComparison,
      alarmComparison,
      alertsByDepartment,
      alertsByZone
    ] = await Promise.all([
      alertService.getButtonComparison(companyId),
      alertService.getAlarmComparison(companyId),
      alertService.getAlertsByDepartment(companyId),
      alertService.getAlertsByZone(companyId)
    ]);

    res.json({
      buttons: buttonComparison,
      alarms: alarmComparison,
      by_department: alertsByDepartment,
      by_zone: alertsByZone,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching alerts comparison:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts comparison',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 🆕 ENDPOINT - Critical Alerts Dashboard
 * Apenas os alertas mais críticos para monitoramento em tempo real
 */
export const getCriticalAlertsDashboard = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
   
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const [
      activeSOS,
      alertSummary,
      highlyCritical,
      multipleAlerts
    ] = await Promise.all([
      deviceService.getActiveSOSAlerts(companyId),
      alertService.getAlertSummary(companyId),
      alertService.getPeopleWithAlerts(companyId, { priority: 'HIGHLY_CRITICAL' }),
      alertService.getPeopleWithMultipleAlerts(companyId)
    ]);

    res.json({
      critical_count: {
        sos_devices: activeSOS.length,
        highly_critical_people: alertSummary?.highly_critical || 0,
        multiple_alerts_people: multipleAlerts.length,
        total_critical: activeSOS.length + (alertSummary?.highly_critical || 0)
      },
      sos_devices: activeSOS,
      highly_critical_people: highlyCritical,
      multiple_alerts_people: multipleAlerts,
      requires_immediate_action: activeSOS.length > 0 || (alertSummary?.highly_critical || 0) > 0,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching critical alerts dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch critical alerts dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};




export const getRawGPSReports = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';

    const filters: Record<string, any> = {};
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;
    if (req.query.battery_level_min) filters.battery_level_min = parseInt(req.query.battery_level_min as string);
    if (req.query.dynamic_motion_state) filters.dynamic_motion_state = req.query.dynamic_motion_state;

    // 🆕 ADICIONE ESTA LINHA - Extrai column_filters
    if (req.query.column_filters) filters.column_filters = req.query.column_filters;

    console.log('🔍 Controller - filters:', filters); // Debug

    const data = await deviceService.getGPSReportsRaw({companyId, page, limit, sortBy, sortOrder, filters });
    res.json(data);
  } catch (error) {
    console.error('Error fetching raw GPS reports:', error);
    res.status(500).json({ 
      error: 'Failed to fetch raw GPS reports',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRawEvents = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';

    const filters: Record<string, any> = {};
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;
    if (req.query.event_type) filters.event_type = req.query.event_type;
    if (req.query.is_valid_event) filters.is_valid_event = req.query.is_valid_event === 'true';
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;

    // 🆕 ADICIONE ESTA LINHA
    if (req.query.column_filters) filters.column_filters = req.query.column_filters;

    console.log('🔍 Events Controller - filters:', filters);

    const data = await deviceService.getEventsManagementRaw({companyId, page, limit, sortBy, sortOrder, filters });
    res.json(data);
  } catch (error) {
    console.error('Error fetching raw events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch raw events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRawScanningMonitoring = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';

    const filters: Record<string, any> = {};
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;

    const data = await deviceService.getScanningMonitoringRaw({ companyId, page, limit, sortBy, sortOrder, filters });
    res.json(data);
  } catch (error) {
    console.error('Error fetching raw scanning data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch raw scanning data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRawConfigurationManagement = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';

    const filters: Record<string, any> = {};
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;
    if (req.query.tracking_mode) filters.tracking_mode = req.query.tracking_mode;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;

    const data = await deviceService.getConfigurationManagementRaw({ companyId, page, limit, sortBy, sortOrder, filters });
    res.json(data);
  } catch (error) {
    console.error('Error fetching raw configuration data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch raw configuration data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRawGPSErrorManagement = async (req: Request, res: Response) => {
  try {

    console.log('Rota chamada ')
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';

    const filters: Record<string, any> = {};
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;
    if (req.query.error_type) filters.error_type = req.query.error_type;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;

    const data = await deviceService.getGPSErrorManagementRaw({companyId, page, limit, sortBy, sortOrder, filters });
    console.log('Dados retornardos: ', data?.data)
    res.json(data);
  } catch (error) {
    console.error('Error fetching raw GPS error data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch raw GPS error data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const exportTableData = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const { table, format } = req.params;
    
    const filters: Record<string, any> = {};
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;

    const data = await deviceService.exportTableData(table, format as 'json' | 'csv', companyId, filters);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${table}_export.csv`);
      res.send(data);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRawHeartbeats = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';
    
    const filters: Record<string, any> = {};
    
    // Filtros específicos da tabela device_heartbeat
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;
    
    // Filtro genérico de colunas
    if (req.query.column_filters) filters.column_filters = req.query.column_filters;
    
    console.log('🔍 Heartbeats Controller - filters:', filters);
    
    const data = await deviceService.getHeartbeatsManagementRaw({
      companyId, 
      page, 
      limit, 
      sortBy, 
      sortOrder, 
      filters 
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching raw heartbeats:', error);
    res.status(500).json({
      error: 'Failed to fetch raw heartbeats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRawScannedBeacons = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';
    
    const filters: Record<string, any> = {};
    
    // Filtros específicos da tabela device_scanned_beacons_list
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;
    if (req.query.beacon_id) filters.beacon_id = req.query.beacon_id;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;
    
    // Filtro genérico de colunas
    if (req.query.column_filters) filters.column_filters = req.query.column_filters;
    
    console.log('🔍 Scanned Beacons Controller - filters:', filters);
    
    const data = await deviceService.getScannedBeaconsManagementRaw({
      companyId, 
      page, 
      limit, 
      sortBy, 
      sortOrder, 
      filters 
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching raw scanned beacons:', error);
    res.status(500).json({
      error: 'Failed to fetch raw scanned beacons',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRawGPSRoute = async (req: Request, res: Response) => {
  try {
    
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }


    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';
    
    const filters: Record<string, any> = {};
    
    // Filtros específicos - agora suporta array ou string
    if (req.query.dev_eui) filters.dev_eui = req.query.dev_eui;
    if (req.query.customer_name) filters.customer_name = req.query.customer_name;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;
    if (req.query.valid_gps_only) filters.valid_gps_only = req.query.valid_gps_only;
    if (req.query.max_accuracy) filters.max_accuracy = req.query.max_accuracy;
    
    // Filtro genérico de colunas
    if (req.query.column_filters) filters.column_filters = req.query.column_filters;
    
    console.log('🔍 GPS Route Controller - filters:', filters);
    
    const data = await deviceService.getGPSRouteManagementRaw({
      companyId, 
      page, 
      limit, 
      sortBy, 
      sortOrder, 
      filters 
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching GPS route:', error);
    res.status(500).json({
      error: 'Failed to fetch GPS route',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// export const getGPSData = async (req: Request, res: Response) => {
//   try {
//     // Parsing de parâmetros de paginação
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;
//     const sortBy = (req.query.sortBy as string) || 'timestamp';
//     const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC' || 'DESC';

//     // Parsing de filtros
//     const filters: any = {};

//     // dev_eui pode ser string ou array
//     if (req.query.dev_eui) {
//       const devEui = req.query.dev_eui;
//       // Se vier como string com vírgulas, converter para array
//       if (typeof devEui === 'string' && devEui.includes(',')) {
//         filters.dev_eui = devEui.split(',').map(d => d.trim()).filter(d => d);
//       } else {
//         filters.dev_eui = devEui;
//       }
//     }

//     // Filtros de data
//     if (req.query.start_date) {
//       filters.start_date = req.query.start_date as string;
//     }

//     if (req.query.end_date) {
//       filters.end_date = req.query.end_date as string;
//     }

//     // Filtros de GPS
//     if (req.query.valid_gps_only) {
//       filters.valid_gps_only = req.query.valid_gps_only === 'true';
//     }

//     if (req.query.max_accuracy) {
//       filters.max_accuracy = parseFloat(req.query.max_accuracy as string);
//     }

//     if (req.query.min_accuracy) {
//       filters.min_accuracy = parseFloat(req.query.min_accuracy as string);
//     }

//     console.log('🔍 GPS Controller - Filters:', JSON.stringify(filters, null, 2));

//     const result = await  deviceService.getGPSData({
//       page,
//       limit,
//       sortBy,
//       sortOrder,
//       filters
//     });

//     res.json(result);
//   } catch (error) {
//     console.error('❌ Error in getGPSData controller:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch GPS data',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };



// export const getGPSData = async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;
//     const sortBy = (req.query.sortBy as string) || 'timestamp';
//     const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC' || 'DESC';
//     const latestOnly = req.query.latest_only === 'true'; // ✨ Novo parâmetro
    
//     const filters: any = {};
    
//     // dev_eui pode ser string ou array
//     if (req.query.dev_eui) {
//       const devEui = req.query.dev_eui;
//       if (typeof devEui === 'string' && devEui.includes(',')) {
//         filters.dev_eui = devEui.split(',').map(d => d.trim()).filter(d => d);
//       } else {
//         filters.dev_eui = devEui;
//       }
//     }

//     if (req.query.start_date) {
//       filters.start_date = req.query.start_date as string;
//     }
//     if (req.query.end_date) {
//       filters.end_date = req.query.end_date as string;
//     }
//     if (req.query.valid_gps_only) {
//       filters.valid_gps_only = req.query.valid_gps_only === 'true';
//     }
//     if (req.query.max_accuracy) {
//       filters.max_accuracy = parseFloat(req.query.max_accuracy as string);
//     }
//     if (req.query.min_accuracy) {
//       filters.min_accuracy = parseFloat(req.query.min_accuracy as string);
//     }

//     console.log('🔍 GPS Controller - Filters:', JSON.stringify(filters, null, 2));
//     console.log('🔍 Latest Only:', latestOnly);

//     const result = await deviceService.getGPSData({
//       page,
//       limit,
//       sortBy,
//       sortOrder,
//       filters,
//       latestOnly // ✨ Passar o novo parâmetro
//     });

//     res.json(result);
//   } catch (error) {
//     console.error('❌ Error in getGPSData controller:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch GPS data',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };



export const getGPSData = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }


    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const sortBy = (req.query.sortBy as string) || 'timestamp';
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC' || 'DESC';
    const latestOnly = req.query.latest_only === 'true';

    const filters: GPSFilters = {};
    
    // Processar dev_eui
    if (req.query.dev_eui) {
      const devEui = req.query.dev_eui;
      if (typeof devEui === 'string' && devEui.includes(',')) {
        filters.dev_eui = devEui.split(',').map(d => d.trim()).filter(d => d);
      } else {
        filters.dev_eui = devEui as string;
      }
    }

    // Processar outros filtros
    if (req.query.start_date) {
      filters.start_date = req.query.start_date as string;
    }
    if (req.query.end_date) {
      filters.end_date = req.query.end_date as string;
    }
    if (req.query.valid_gps_only) {
      filters.valid_gps_only = req.query.valid_gps_only === 'true';
    }
    if (req.query.max_accuracy) {
      filters.max_accuracy = parseFloat(req.query.max_accuracy as string);
    }
    if (req.query.min_accuracy) {
      filters.min_accuracy = parseFloat(req.query.min_accuracy as string);
    }

    console.log('🔍 GPS Controller - Filters:', JSON.stringify(filters, null, 2));
    console.log('🔍 Latest Only:', latestOnly);

    const result = await deviceService.getGPSData({
      companyId,
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
      latestOnly
    });

    res.json(result);
  } catch (error) {
    console.error('❌ Error in getGPSData controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch GPS data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



export const getGPSStats = async (req: Request, res: Response) => {
  try {

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    const filters: any = {};

    if (req.query.dev_eui) {
      const devEui = req.query.dev_eui;
      if (typeof devEui === 'string' && devEui.includes(',')) {
        filters.dev_eui = devEui.split(',').map(d => d.trim()).filter(d => d);
      } else {
        filters.dev_eui = devEui;
      }
    }

    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;

    const stats = await deviceService.getGPSStats(companyId, filters);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error in getGPSStats controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch GPS statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


// Endpoint simplificado - apenas lista de DEV_EUIs
export const getDeviceList = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    console.log('📋 Fetching device list...');

    const devices = await deviceService.getDeviceList(companyId);

    res.json({
      success: true,
      data: devices,
      total: devices.length,
    });
  } catch (error) {
    console.error('❌ Error in getDeviceList controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device list',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};