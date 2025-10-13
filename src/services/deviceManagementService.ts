// src/services/deviceManagementService.ts
import { xfinderdb_prod } from '../db/xfinderdb_prod'
import { QueryResult, RowDataPacket } from 'mysql2';


// =====================================
// 📊 INTERFACES ADICIONAIS - RAW DATA
// =====================================
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
  };
}



// =====================================
// 📍 INTERFACES - GPS & POSITIONING
// =====================================
interface DevicePosition extends RowDataPacket {
  dev_eui: string;
  gps_latitude: number;
  gps_longitude: number;
  gps_accuracy: number;
  timestamp: string;
  battery_level: number;
  dynamic_motion_state: string;
  customer_name: string;
  domain_name: string;
}

interface DeviceRoute extends RowDataPacket {
  timestamp: string;
  gps_latitude: number;
  gps_longitude: number;
  gps_accuracy: number;
  speed: number;
  heading: number;
  distance_from_last_position_m: number;
}

interface LowBatteryDevice extends RowDataPacket {
  dev_eui: string;
  customer_name: string;
  domain_name: string;
  timestamp: string;
  battery_level: number;
  battery_status: string;
  gps_latitude: number;
  gps_longitude: number;
}

interface OfflineDevice extends RowDataPacket {
  dev_eui: string;
  customer_name: string;
  last_position: string;
  hours_offline: number;
  battery_level: number;
}

interface GatewaySignal extends RowDataPacket {
  gateway_name: string;
  report_count: number;
  avg_rssi: number;
  avg_snr: number;
  min_rssi: number;
  max_rssi: number;
}

interface CustomerActivity extends RowDataPacket {
  customer_name: string;
  domain_name: string;
  total_devices: number;
  total_reports: number;
  avg_battery: number;
  last_activity: string;
}

// =====================================
// 🚨 INTERFACES - EVENTS & ALERTS
// =====================================
interface SOSAlert extends RowDataPacket {
  dev_eui: string;
  customer_name: string;
  sos_start_time: string;
  gps_latitude: number;
  gps_longitude: number;
  battery_level: number;
  minutes_elapsed: number;
}

interface EventSummary extends RowDataPacket {
  total_sos_events: number;
  unique_devices: number;
  event_type: string;
}

interface MotionEvent extends RowDataPacket {
  dev_eui: string;
  customer_name: string;
  event_timestamp: string;
  dynamic_motion_state: string;
  battery_level: number;
  temperature: number;
}

interface DuplicateRate extends RowDataPacket {
  dev_eui: string;
  customer_name: string;
  total_events: number;
  duplicates: number;
  duplicate_rate_percent: number;
}

interface EventTypeStats extends RowDataPacket {
  event_type: string;
  total: number;
  valid_events: number;
  duplicate_events: number;
  unique_devices: number;
}

interface GeofenceViolation extends RowDataPacket {
  dev_eui: string;
  customer_name: string;
  event_type: string;
  event_timestamp: string;
  trigger_parameters: string;
  gps_latitude: number;
  gps_longitude: number;
}

// =====================================
// ⚙️ INTERFACES - CONFIGURATION
// =====================================
interface DeviceConfig extends RowDataPacket {
  dev_eui: string;
  customer_name: string;
  config_timestamp: string;
  tracking_mode: string;
  tracking_ul_period: number;
  loralive_period: number;
  periodic_position_interval: number;
  gps_scan_mode: string;
  battery_level: number;
  temperature: number;
}

interface ConfigHistory extends RowDataPacket {
  config_timestamp: string;
  tracking_mode: string;
  tracking_ul_period: number;
  periodic_position_interval: number;
  battery_level: number;
  misc_data_tag: string;
}

interface TrackingModeStats extends RowDataPacket {
  tracking_mode: string;
  total_devices: number;
  avg_battery: number;
  avg_temperature: number;
}

// =====================================
// 📊 INTERFACES - KPIs & ANALYTICS
// =====================================
interface DeviceUptime extends RowDataPacket {
  devices_online: number;
  total_devices: number;
  uptime_percentage: number;
}

interface GPSSuccessRate extends RowDataPacket {
  total_reports: number;
  valid_gps_reports: number;
  success_rate_percent: number;
}

interface BatteryHealth extends RowDataPacket {
  total_devices: number;
  healthy_devices: number;
  warning_devices: number;
  critical_devices: number;
  health_percentage: number;
}

interface AccuracyDistribution extends RowDataPacket {
  accuracy_range: string;
  report_count: number;
  percentage: number;
}

interface GetDataParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}


// =====================================
// 📍 GPS & POSITIONING QUERIES
// =====================================

/**
 * Q1: Posição atual do dispositivo
 */
export const getCurrentDevicePosition = async (devEui: string) => {
  const [rows] = await xfinderdb_prod.query<DevicePosition[]>(`
    SELECT 
      dev_eui,
      gps_latitude,
      gps_longitude,
      gps_accuracy,
      timestamp,
      battery_level
    FROM (
      SELECT 
        dev_eui,
        gps_latitude,
        gps_longitude,
        gps_accuracy,
        timestamp,
        battery_level,
        ROW_NUMBER() OVER (PARTITION BY dev_eui ORDER BY timestamp DESC) AS row_num
      FROM device_gps_report_monitoring
      WHERE dev_eui = ?
    ) AS ranked
    WHERE row_num = 1
  `, [devEui]);

  return rows[0] || null;
};

/**
 * Q2: Rota do dispositivo nas últimas 24 horas
 */
export const getDeviceRoute24h = async (devEui: string) => {
  const [rows] = await xfinderdb_prod.query<DeviceRoute[]>(`
    SELECT 
      timestamp,
      gps_latitude,
      gps_longitude,
      gps_accuracy,
      speed,
      heading,
      distance_from_last_position_m
    FROM device_gps_report_monitoring
    WHERE dev_eui = ?
      AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      AND is_valid_gps = 1
    ORDER BY timestamp ASC
  `, [devEui]);

  return rows;
};

/**
 * Q3: Dispositivos em movimento vs estáticos
 */
export const getDevicesByMotionState = async () => {
  const [rows] = await xfinderdb_prod.query<DevicePosition[]>(`
    SELECT 
      dev_eui,
      customer_name,
      dynamic_motion_state,
      timestamp,
      battery_level
    FROM (
      SELECT 
        dev_eui,
        customer_name,
        dynamic_motion_state,
        timestamp,
        battery_level,
        ROW_NUMBER() OVER (PARTITION BY dev_eui ORDER BY timestamp DESC) AS row_num
      FROM device_gps_report_monitoring
    ) AS ranked
    WHERE row_num = 1
    ORDER BY dynamic_motion_state, customer_name
  `);

  return rows;
};

/**
 * Q4: Dispositivos com bateria baixa (< 20%)
 */
export const getLowBatteryDevices = async () => {
  const [rows] = await xfinderdb_prod.query<LowBatteryDevice[]>(`
    SELECT 
      dev_eui,
      customer_name,
      domain_name,
      timestamp,
      battery_level,
      battery_status,
      gps_latitude,
      gps_longitude
    FROM (
      SELECT 
        dev_eui,
        customer_name,
        domain_name,
        timestamp,
        battery_level,
        battery_status,
        gps_latitude,
        gps_longitude,
        ROW_NUMBER() OVER (PARTITION BY dev_eui ORDER BY timestamp DESC) AS row_num
      FROM device_gps_report_monitoring
    ) AS ranked
    WHERE row_num = 1
      AND battery_level < 20
    ORDER BY battery_level ASC
  `);

  return rows;
};

/**
 * Q5: Dispositivos offline (sem posição por 24h+)
 */
export const getOfflineDevices = async () => {
  const [rows] = await xfinderdb_prod.query<OfflineDevice[]>(`
    SELECT 
      dev_eui,
      customer_name,
      timestamp AS last_position,
      TIMESTAMPDIFF(HOUR, timestamp, NOW()) AS hours_offline,
      battery_level
    FROM (
      SELECT 
        dev_eui,
        customer_name,
        timestamp,
        battery_level,
        ROW_NUMBER() OVER (PARTITION BY dev_eui ORDER BY timestamp DESC) AS row_num
      FROM device_gps_report_monitoring
    ) AS ranked
    WHERE row_num = 1
      AND timestamp < DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ORDER BY timestamp ASC
  `);

  return rows;
};

/**
 * Q6: Qualidade de sinal por gateway
 */
export const getGatewaySignalQuality = async () => {
  const [rows] = await xfinderdb_prod.query<GatewaySignal[]>(`
    SELECT 
      gateway_name,
      COUNT(*) AS report_count,
      AVG(lora_rssi) AS avg_rssi,
      AVG(lora_snr) AS avg_snr,
      MIN(lora_rssi) AS min_rssi,
      MAX(lora_rssi) AS max_rssi
    FROM device_gps_report_monitoring
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      AND gateway_name IS NOT NULL
    GROUP BY gateway_name
    ORDER BY report_count DESC
  `);

  return rows;
};

/**
 * Q7: Dispositivos ativos por cliente/domínio
 */
export const getCustomerActivity = async () => {
  const [rows] = await xfinderdb_prod.query<CustomerActivity[]>(`
    SELECT 
      customer_name,
      domain_name,
      COUNT(DISTINCT dev_eui) AS total_devices,
      COUNT(*) AS total_reports,
      AVG(battery_level) AS avg_battery,
      MAX(timestamp) AS last_activity
    FROM device_gps_report_monitoring
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    GROUP BY customer_name, domain_name
    ORDER BY total_devices DESC
  `);

  return rows;
};

// =====================================
// 🚨 EVENT & ALERT QUERIES
// =====================================

/**
 * Q8: Alertas SOS ativos
 */
export const getActiveSOSAlerts = async () => {
  const [rows] = await xfinderdb_prod.query<SOSAlert[]>(`
    SELECT 
      a.dev_eui,
      a.customer_name,
      a.event_timestamp AS sos_start_time,
      CAST(COALESCE(a.gps_latitude, gps.gps_latitude) AS DECIMAL(10,8)) AS gps_latitude,
      CAST(COALESCE(a.gps_longitude, gps.gps_longitude) AS DECIMAL(11,8)) AS gps_longitude,
      COALESCE(a.battery_level, gps.battery_level) AS battery_level,
      TIMESTAMPDIFF(MINUTE, a.event_timestamp, NOW()) AS minutes_elapsed
    FROM device_events_management a
    LEFT JOIN (
      SELECT 
        dev_eui,
        gps_latitude,
        gps_longitude,
        battery_level,
        ROW_NUMBER() OVER (PARTITION BY dev_eui ORDER BY timestamp DESC) AS row_num
      FROM device_gps_report_monitoring
      WHERE gps_latitude IS NOT NULL 
        AND gps_longitude IS NOT NULL
        AND is_valid_gps = 1
    ) gps ON a.dev_eui = gps.dev_eui AND gps.row_num = 1
    WHERE a.event_type = 'SOS_MODE_START'
      AND a.is_valid_event = 1
      AND NOT EXISTS (
        SELECT 1 
        FROM device_events_management b 
        WHERE b.dev_eui = a.dev_eui 
          AND b.event_type = 'SOS_MODE_END'
          AND b.event_timestamp > a.event_timestamp
          AND b.is_valid_event = 1
      )
    ORDER BY a.event_timestamp DESC
  `);

  return rows;
};

/**
 * Q9: Eventos SOS nas últimas 24h
 */
export const getSOSEvents24h = async () => {
  const [rows] = await xfinderdb_prod.query<EventSummary[]>(`
    SELECT 
      COUNT(*) AS total_sos_events,
      COUNT(DISTINCT dev_eui) AS unique_devices,
      event_type
    FROM device_events_management
    WHERE (event_type = 'SOS_MODE_START' OR event_type = 'SOS_MODE_END')
      AND event_timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      AND is_valid_event = 1
    GROUP BY event_type
  `);

  return rows;
};

/**
 * Q10: Transições movimento → estático hoje
 */
export const getMotionToStaticToday = async () => {
  const [rows] = await xfinderdb_prod.query<MotionEvent[]>(`
    SELECT 
      dev_eui,
      customer_name,
      event_timestamp,
      dynamic_motion_state,
      battery_level,
      temperature
    FROM device_events_management
    WHERE event_type = 'MOTION_END'
      AND event_timestamp >= CURDATE()
      AND is_valid_event = 1
    ORDER BY event_timestamp DESC
  `);

  return rows;
};

/**
 * Q11: Taxa de eventos duplicados por dispositivo
 */
export const getDuplicateEventRate = async () => {
  const [rows] = await xfinderdb_prod.query<DuplicateRate[]>(`
    SELECT 
      dev_eui,
      customer_name,
      COUNT(*) AS total_events,
      SUM(CASE WHEN is_valid_event = 0 THEN 1 ELSE 0 END) AS duplicates,
      ROUND((SUM(CASE WHEN is_valid_event = 0 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS duplicate_rate_percent
    FROM device_events_management
    WHERE event_timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    GROUP BY dev_eui, customer_name
    HAVING duplicates > 0
    ORDER BY duplicate_rate_percent DESC
  `);

  return rows;
};

/**
 * Q12: Tipos de eventos mais comuns
 */
export const getMostCommonEventTypes = async () => {
  const [rows] = await xfinderdb_prod.query<EventTypeStats[]>(`
    SELECT 
      event_type,
      COUNT(*) AS total,
      SUM(CASE WHEN is_valid_event = 1 THEN 1 ELSE 0 END) AS valid_events,
      SUM(CASE WHEN is_valid_event = 0 THEN 1 ELSE 0 END) AS duplicate_events,
      COUNT(DISTINCT dev_eui) AS unique_devices
    FROM device_events_management
    WHERE event_timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    GROUP BY event_type
    ORDER BY total DESC
  `);

  return rows;
};

/**
 * Q13: Violações de geofence
 */
export const getGeofenceViolations = async (limit: number = 100) => {
  const [rows] = await xfinderdb_prod.query<GeofenceViolation[]>(`
    SELECT 
      dev_eui,
      customer_name,
      event_type,
      event_timestamp,
      trigger_parameters,
      gps_latitude,
      gps_longitude
    FROM device_events_management
    WHERE event_type IN ('GEOFENCE_ENTRY', 'GEOFENCE_EXIT')
      AND is_valid_event = 1
    ORDER BY event_timestamp DESC
    LIMIT ?
  `, [limit]);

  return rows;
};

// =====================================
// ⚙️ CONFIGURATION QUERIES
// =====================================

/**
 * Q15: Configuração atual do dispositivo
 */
export const getCurrentDeviceConfig = async (devEui: string) => {
  const [rows] = await xfinderdb_prod.query<DeviceConfig[]>(`
    SELECT 
      dev_eui,
      customer_name,
      config_timestamp,
      tracking_mode,
      tracking_ul_period,
      loralive_period,
      periodic_position_interval,
      gps_scan_mode,
      battery_level,
      temperature
    FROM device_configuration_management
    WHERE dev_eui = ?
    ORDER BY config_timestamp DESC
    LIMIT 1
  `, [devEui]);

  return rows[0] || null;
};

/**
 * Q16: Histórico de configurações do dispositivo
 */
export const getDeviceConfigHistory = async (devEui: string, limit: number = 5) => {
  const [rows] = await xfinderdb_prod.query<ConfigHistory[]>(`
    SELECT 
      config_timestamp,
      tracking_mode,
      tracking_ul_period,
      periodic_position_interval,
      battery_level,
      misc_data_tag
    FROM device_configuration_management
    WHERE dev_eui = ?
    ORDER BY config_timestamp DESC
    LIMIT ?
  `, [devEui, limit]);

  return rows;
};

/**
 * Q19: Distribuição por modo de rastreamento
 */
export const getTrackingModeDistribution = async () => {
  const [rows] = await xfinderdb_prod.query<TrackingModeStats[]>(`
    SELECT 
      tracking_mode,
      COUNT(DISTINCT dev_eui) AS total_devices,
      AVG(battery_level) AS avg_battery,
      AVG(temperature) AS avg_temperature
    FROM microview_device_latest_config
    GROUP BY tracking_mode
    ORDER BY total_devices DESC
  `);

  return rows;
};

// =====================================
// 📊 KPI QUERIES
// =====================================

/**
 * Q26: Device uptime (última hora)
 */
export const getDeviceUptime = async () => {
  const [rows] = await xfinderdb_prod.query<DeviceUptime[]>(`
    SELECT 
      COUNT(DISTINCT CASE 
        WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR) 
        THEN dev_eui 
      END) AS devices_online,
      COUNT(DISTINCT dev_eui) AS total_devices,
      ROUND((COUNT(DISTINCT CASE 
        WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR) 
        THEN dev_eui 
      END) / COUNT(DISTINCT dev_eui)) * 100, 2) AS uptime_percentage
    FROM device_gps_report_monitoring
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `);

  return rows[0] || null;
};

/**
 * Q27: Taxa de sucesso do GPS
 */
export const getGPSSuccessRate = async () => {
  const [rows] = await xfinderdb_prod.query<GPSSuccessRate[]>(`
    SELECT 
      COUNT(*) AS total_reports,
      SUM(CASE WHEN is_valid_gps = 1 THEN 1 ELSE 0 END) AS valid_gps_reports,
      ROUND((SUM(CASE WHEN is_valid_gps = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS success_rate_percent
    FROM device_gps_report_monitoring
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `);

  return rows[0] || null;
};

/**
 * Q29: Resumo da saúde da bateria
 */
export const getBatteryHealthSummary = async () => {
  const [rows] = await xfinderdb_prod.query<BatteryHealth[]>(`
    SELECT 
      COUNT(DISTINCT dev_eui) AS total_devices,
      SUM(CASE WHEN battery_level >= 30 THEN 1 ELSE 0 END) AS healthy_devices,
      SUM(CASE WHEN battery_level BETWEEN 20 AND 29 THEN 1 ELSE 0 END) AS warning_devices,
      SUM(CASE WHEN battery_level < 20 THEN 1 ELSE 0 END) AS critical_devices,
      ROUND((SUM(CASE WHEN battery_level >= 30 THEN 1 ELSE 0 END) / COUNT(DISTINCT dev_eui)) * 100, 2) AS health_percentage
    FROM (
      SELECT 
        dev_eui,
        battery_level,
        ROW_NUMBER() OVER (PARTITION BY dev_eui ORDER BY timestamp DESC) AS row_num
      FROM device_gps_report_monitoring
      WHERE battery_level IS NOT NULL
    ) AS ranked
    WHERE row_num = 1
  `);

  return rows[0] || null;
};

/**
 * Q30: Distribuição de precisão de posição
 */
export const getPositionAccuracyDistribution = async () => {
  const [rows] = await xfinderdb_prod.query<AccuracyDistribution[]>(`
    SELECT 
      CASE 
        WHEN gps_accuracy <= 10 THEN 'Excellent (<10m)'
        WHEN gps_accuracy <= 30 THEN 'Good (10-30m)'
        WHEN gps_accuracy <= 50 THEN 'Fair (30-50m)'
        ELSE 'Poor (>50m)'
      END AS accuracy_range,
      COUNT(*) AS report_count,
      ROUND((COUNT(*) / (SELECT COUNT(*) FROM device_gps_report_monitoring 
                         WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
                         AND gps_accuracy IS NOT NULL)) * 100, 2) AS percentage
    FROM device_gps_report_monitoring
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      AND gps_accuracy IS NOT NULL
    GROUP BY accuracy_range
    ORDER BY MIN(gps_accuracy)
  `);

  return rows;
};

// * Retorna dados brutos da tabela device_gps_report_monitoring*/
export const getGPSReportsRaw = async (params: PaginationParams): Promise<PaginatedResponse<RowDataPacket>> => {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const sortBy = params.sortBy || 'timestamp';
  const sortOrder = params.sortOrder || 'DESC';

  // Build WHERE clause
  let whereClause = '1=1';
  const queryParams: any[] = [];

  if (params.filters) {
    if (params.filters.dev_eui) {
      whereClause += ' AND dev_eui = ?';
      queryParams.push(params.filters.dev_eui);
    }
    if (params.filters.customer_name) {
      whereClause += ' AND customer_name LIKE ?';
      queryParams.push(`%${params.filters.customer_name}%`);
    }
    if (params.filters.start_date) {
      whereClause += ' AND timestamp >= ?';
      queryParams.push(params.filters.start_date);
    }
    if (params.filters.end_date) {
      whereClause += ' AND timestamp <= ?';
      queryParams.push(params.filters.end_date);
    }
    if (params.filters.battery_level_min !== undefined) {
      whereClause += ' AND battery_level >= ?';
      queryParams.push(params.filters.battery_level_min);
    }
    if (params.filters.dynamic_motion_state) {
      whereClause += ' AND dynamic_motion_state = ?';
      queryParams.push(params.filters.dynamic_motion_state);
    }
  }

  // Count total records
  const [countResult] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM device_gps_report_monitoring WHERE ${whereClause}`,
    queryParams
  );
  const totalRecords = countResult[0].total;

  // Get paginated data
  const [rows] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT * FROM device_gps_report_monitoring 
     WHERE ${whereClause} 
     ORDER BY ${sortBy} ${sortOrder} 
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      current_page: page,
      per_page: limit,
      total_records: totalRecords,
      total_pages: Math.ceil(totalRecords / limit),
    },
  };
};

// =====================================
// 🗄️ RAW DATA QUERIES - TABLE 2
// =====================================

/**
 * Retorna dados brutos da tabela device_events_management
 */

export const getEventsManagementRaw = async (params: any): Promise<PaginatedResponse<RowDataPacket>> => {
  console.log('🔍 PARAMS RECEBIDOS NO BACKEND (RAW):', params);
  
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 50;
  const offset = (page - 1) * limit;

  const validSortColumns = ['id', 'event_timestamp', 'event_type', 'dev_eui', 'customer_name'];
  const sortBy = validSortColumns.includes(params.sortBy || '') ? params.sortBy : 'id';
  const sortOrder = params.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  let whereClause = '1=1';
  const queryParams: any[] = [];

  // 🎯 CORREÇÃO: Buscar column_filters DENTRO de filters
  if (params.filters?.column_filters) {
    console.log('🎯 COLUMN_FILTERS ENCONTRADO em filters.column_filters:', params.filters.column_filters);
    
    try {
      const columnFilters = typeof params.filters.column_filters === 'string' 
        ? JSON.parse(params.filters.column_filters) 
        : params.filters.column_filters;

      console.log('🔍 COLUMN_FILTERS PARSEADO:', columnFilters);

      if (columnFilters && typeof columnFilters === 'object') {
        Object.entries(columnFilters).forEach(([column, value]) => {
          console.log(`🔍 Processando filtro: ${column} = "${value}"`);
          
          if (value !== null && value !== undefined && String(value).trim() !== '') {
            const validColumns = [
              'id', 'event_timestamp', 'event_type', 'dev_eui', 'customer_name', 
              'battery_level', 'is_valid_event', 'temperature', 'dynamic_motion_state',
              'gps_latitude', 'gps_longitude', 'gps_accuracy', 'speed'
            ];
            
            if (validColumns.includes(column)) {
              whereClause += ` AND ${column} LIKE ?`;
              queryParams.push(`%${value}%`);
              console.log(`✅ Filtro aplicado: ${column} LIKE %${value}%`);
            } else {
              console.warn(`🚫 Coluna inválida ignorada: ${column}`);
            }
          }
        });
      }
    } catch (error) {
      console.error('💥 Erro ao processar column_filters:', error);
    }
  } else {
    console.log('ℹ️  Nenhum column_filters encontrado em filters.column_filters');
  }

  // 🎯 Também verifica outros filtros dentro de filters
  if (params.filters) {
    console.log('🔍 Outros filtros em params.filters:', params.filters);
    
    if (params.filters.dev_eui) {
      whereClause += ' AND dev_eui = ?';
      queryParams.push(params.filters.dev_eui);
      console.log(`✅ Filtro dev_eui aplicado: ${params.filters.dev_eui}`);
    }
    
    if (params.filters.event_type) {
      whereClause += ' AND event_type = ?';
      queryParams.push(params.filters.event_type);
      console.log(`✅ Filtro event_type aplicado: ${params.filters.event_type}`);
    }
    
    if (params.filters.customer_name) {
      whereClause += ' AND customer_name LIKE ?';
      queryParams.push(`%${params.filters.customer_name}%`);
      console.log(`✅ Filtro customer_name aplicado: ${params.filters.customer_name}`);
    }
    
    if (params.filters.is_valid_event !== undefined) {
      whereClause += ' AND is_valid_event = ?';
      queryParams.push(params.filters.is_valid_event);
      console.log(`✅ Filtro is_valid_event aplicado: ${params.filters.is_valid_event}`);
    }
    
    if (params.filters.start_date) {
      whereClause += ' AND event_timestamp >= ?';
      queryParams.push(params.filters.start_date);
      console.log(`✅ Filtro start_date aplicado: ${params.filters.start_date}`);
    }
    
    if (params.filters.end_date) {
      whereClause += ' AND event_timestamp <= ?';
      queryParams.push(params.filters.end_date);
      console.log(`✅ Filtro end_date aplicado: ${params.filters.end_date}`);
    }
  }

  console.log('🎯 QUERY FINAL:');
  console.log('WHERE:', whereClause);
  console.log('PARAMS:', queryParams);
  console.log('SORT:', `${sortBy} ${sortOrder}`);
  console.log('PAGINATION:', `LIMIT ${limit} OFFSET ${offset}`);

  try {
    const [countResult] = await xfinderdb_prod.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM device_events_management WHERE ${whereClause}`,
      queryParams
    );

    const totalRecords = countResult?.[0]?.total ?? 0;

    const [rows] = await xfinderdb_prod.query<RowDataPacket[]>(
      `SELECT * FROM device_events_management 
       WHERE ${whereClause} 
       ORDER BY ${sortBy} ${sortOrder} 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    console.log(`✅ Sucesso: ${rows.length} registros de ${totalRecords} total`);

    return {
      data: rows,
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / limit),
      },
    };
  } catch (error: any) {
    console.error('❌ Erro ao buscar eventos:', error.sqlMessage || error.message);
    throw new Error(error.sqlMessage || 'Erro ao buscar eventos');
  }
};


// =====================================
// 🗄️ RAW DATA QUERIES - TABLE 3
// =====================================

/**
 * Retorna dados brutos da tabela device_scanning_monitoring
 */
export const getScanningMonitoringRaw = async (params: PaginationParams): Promise<PaginatedResponse<RowDataPacket>> => {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const sortBy = params.sortBy || 'timestamp';
  const sortOrder = params.sortOrder || 'DESC';

  let whereClause = '1=1';
  const queryParams: any[] = [];

  if (params.filters) {
    if (params.filters.dev_eui) {
      whereClause += ' AND dev_eui = ?';
      queryParams.push(params.filters.dev_eui);
    }
    if (params.filters.customer_name) {
      whereClause += ' AND customer_name LIKE ?';
      queryParams.push(`%${params.filters.customer_name}%`);
    }
    if (params.filters.start_date) {
      whereClause += ' AND timestamp >= ?';
      queryParams.push(params.filters.start_date);
    }
    if (params.filters.end_date) {
      whereClause += ' AND timestamp <= ?';
      queryParams.push(params.filters.end_date);
    }
  }

  const [countResult] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM device_scanning_monitoring WHERE ${whereClause}`,
    queryParams
  );
  const totalRecords = countResult[0].total;

  const [rows] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT * FROM device_scanning_monitoring 
     WHERE ${whereClause} 
     ORDER BY ${sortBy} ${sortOrder} 
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      current_page: page,
      per_page: limit,
      total_records: totalRecords,
      total_pages: Math.ceil(totalRecords / limit),
    },
  };
};

// =====================================
// 🗄️ RAW DATA QUERIES - TABLE 4
// =====================================

/**
 * Retorna dados brutos da tabela device_configuration_management
 */
export const getConfigurationManagementRaw = async (
  params: PaginationParams
): Promise<PaginatedResponse<RowDataPacket>> => {

  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  // 🔒 Campos válidos para ordenação — evita erros e SQL injection
  const validSortColumns = [
    'id',
    'dev_eui',
    'config_timestamp',
    'customer_name',
    'tracking_mode',
    'gateway_name',
    'battery_level',
    'temperature'
  ];

  // Usa config_timestamp se o sortBy vier vazio ou inválido
  const sortBy =
    validSortColumns.includes(params.sortBy ?? '')
      ? params.sortBy
      : 'config_timestamp';

  const sortOrder =
    params.sortOrder && ['ASC', 'DESC'].includes(params.sortOrder.toUpperCase())
      ? params.sortOrder.toUpperCase()
      : 'DESC';

  let whereClause = '1=1';
  const queryParams: any[] = [];

  if (params.filters) {
    if (params.filters.dev_eui) {
      whereClause += ' AND dev_eui = ?';
      queryParams.push(params.filters.dev_eui);
    }
    if (params.filters.customer_name) {
      whereClause += ' AND customer_name LIKE ?';
      queryParams.push(`%${params.filters.customer_name}%`);
    }
    if (params.filters.tracking_mode) {
      whereClause += ' AND tracking_mode = ?';
      queryParams.push(params.filters.tracking_mode);
    }
    if (params.filters.start_date) {
      whereClause += ' AND config_timestamp >= ?';
      queryParams.push(params.filters.start_date);
    }
    if (params.filters.end_date) {
      whereClause += ' AND config_timestamp <= ?';
      queryParams.push(params.filters.end_date);
    }
  }

  const [countResult] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM device_configuration_management WHERE ${whereClause}`,
    queryParams
  );
  const totalRecords = countResult[0]?.total || 0;

  const [rows] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT * FROM device_configuration_management 
     WHERE ${whereClause} 
     ORDER BY ${sortBy} ${sortOrder} 
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      current_page: page,
      per_page: limit,
      total_records: totalRecords,
      total_pages: Math.ceil(totalRecords / limit),
    },
  };
};


// =====================================
// 🗄️ RAW DATA QUERIES - TABLE 5
// =====================================

/**
 * Retorna dados brutos da tabela device_gps_error_management
 */
export const getGPSErrorManagementRaw = async (
  params: PaginationParams
): Promise<PaginatedResponse<RowDataPacket>> => {

  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  // 🔒 Campos válidos para ordenação
  const validSortColumns = [
    'id',
    'dev_eui',
    'failure_type',
    'message_type',
    'created_at',
    'latitude',
    'longitude'
  ];

  const sortBy =
    validSortColumns.includes(params.sortBy ?? '')
      ? params.sortBy
      : 'created_at';

  const sortOrder =
    params.sortOrder && ['ASC', 'DESC'].includes(params.sortOrder.toUpperCase())
      ? params.sortOrder.toUpperCase()
      : 'DESC';

  let whereClause = '1=1';
  const queryParams: any[] = [];

  if (params.filters) {
    if (params.filters.dev_eui) {
      whereClause += ' AND dev_eui = ?';
      queryParams.push(params.filters.dev_eui);
    }
    if (params.filters.customer_name) {
      whereClause += ' AND customer_name LIKE ?';
      queryParams.push(`%${params.filters.customer_name}%`);
    }
    if (params.filters.error_type) {
      whereClause += ' AND failure_type = ?';
      queryParams.push(params.filters.error_type);
    }
    if (params.filters.start_date) {
      whereClause += ' AND created_at >= ?';
      queryParams.push(params.filters.start_date);
    }
    if (params.filters.end_date) {
      whereClause += ' AND created_at <= ?';
      queryParams.push(params.filters.end_date);
    }
  }

  const [countResult] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM device_gps_error_management WHERE ${whereClause}`,
    queryParams
  );
  const totalRecords = countResult[0]?.total || 0;

  const [rows] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT * FROM device_gps_error_management 
     WHERE ${whereClause} 
     ORDER BY ${sortBy} ${sortOrder} 
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      current_page: page,
      per_page: limit,
      total_records: totalRecords,
      total_pages: Math.ceil(totalRecords / limit),
    },
  };
};


export const getHeartbeatsManagementRaw = async ({
  page,
  limit,
  sortBy = 'heartbeat_timestamp',
  sortOrder = 'DESC',
  filters = {}
}: GetDataParams) => {
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM device_heartbeat WHERE 1=1';
  const params: any[] = [];

  // Aplicar filtros específicos
  if (filters.dev_eui) {
    query += ` AND dev_eui = ?`;
    params.push(filters.dev_eui);
  }

  if (filters.customer_name) {
    query += ` AND customer_name LIKE ?`;
    params.push(`%${filters.customer_name}%`);
  }

  if (filters.start_date) {
    query += ` AND heartbeat_timestamp >= ?`;
    params.push(filters.start_date);
  }

  if (filters.end_date) {
    query += ` AND heartbeat_timestamp <= ?`;
    params.push(filters.end_date);
  }

  // Filtros genéricos por coluna (JSON)
  if (filters.column_filters) {
    try {
      const columnFilters = typeof filters.column_filters === 'string' 
        ? JSON.parse(filters.column_filters) 
        : filters.column_filters;

      for (const [column, value] of Object.entries(columnFilters)) {
        if (value !== null && value !== undefined && value !== '') {
          query += ` AND ${column} = ?`;
          params.push(value);
        }
      }
    } catch (error) {
      console.error('Error parsing column_filters:', error);
    }
  }

  // Count total - MySQL retorna [rows, fields]
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const [countRows] = await xfinderdb_prod.query(countQuery, params);
  const total = (countRows as any)[0].count;

  // Adicionar ordenação e paginação
  query += ` ORDER BY ${sortBy} ${sortOrder}`;
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  console.log('🔍 Query:', query);
  console.log('🔍 Params:', params);

  // MySQL retorna [rows, fields]
  const [rows] = await xfinderdb_prod.query(query, params);

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};


export const getScannedBeaconsManagementRaw = async ({
  page,
  limit,
  sortBy = 'dev_eui',
  sortOrder = 'DESC',
  filters = {}
}: GetDataParams) => {
  // Validação prévia
  if (!page || page < 1) page = 1;
  if (!limit || limit < 1) limit = 50;
  
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM device_scanned_beacons_list WHERE 1=1';
  const params: any[] = [];

  // Aplicar filtros específicos
  if (filters.dev_eui) {
    query += ` AND dev_eui = ?`;
    params.push(filters.dev_eui);
  }

  if (filters.customer_name) {
    query += ` AND customer_name LIKE ?`;
    params.push(`%${filters.customer_name}%`);
  }

  if (filters.beacon_id) {
    query += ` AND beacon_id = ?`;
    params.push(filters.beacon_id);
  }

  if (filters.start_date) {
    query += ` AND scanned_at >= ?`;
    params.push(filters.start_date);
  }

  if (filters.end_date) {
    query += ` AND scanned_at <= ?`;
    params.push(filters.end_date);
  }

  // Filtros genéricos por coluna (JSON)
  if (filters.column_filters) {
    try {
      const columnFilters = typeof filters.column_filters === 'string' 
        ? JSON.parse(filters.column_filters) 
        : filters.column_filters;

      for (const [column, value] of Object.entries(columnFilters)) {
        if (value !== null && value !== undefined && value !== '') {
          query += ` AND ${column} = ?`;
          params.push(value);
        }
      }
    } catch (error) {
      console.error('Error parsing column_filters:', error);
    }
  }

  // Count total - MySQL retorna [rows, fields]
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  
  try {
    const [countRows] = await xfinderdb_prod.query(countQuery, params);
    const total = (countRows as any)[0]?.count || 0;

    // Adicionar ordenação e paginação
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    console.log('🔍 Query:', query);
    console.log('🔍 Params:', params);

    // MySQL retorna [rows, fields]
    const [rows] = await xfinderdb_prod.query(query, params);

    return {
      data: rows || [],
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: total,
        total_pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in getScannedBeaconsManagementRaw:', error);
    throw error;
  }
};



// =====================================
// 📥 EXPORT DATA (CSV/JSON)
// =====================================

/**
 * Exporta dados de uma tabela em formato JSON ou CSV
 */
export const exportTableData = async (
  tableName: string,
  format: 'json' | 'csv',
  filters?: Record<string, any>
): Promise<any> => {
  const validTables = [
    'device_gps_report_monitoring',
    'device_events_management',
    'device_scanning_monitoring',
    'device_configuration_management',
    'device_gps_error_management',
  ];

  if (!validTables.includes(tableName)) {
    throw new Error('Invalid table name');
  }

  // Build WHERE clause
  let whereClause = '1=1';
  const queryParams: any[] = [];

  if (filters) {
    if (filters.dev_eui) {
      whereClause += ' AND dev_eui = ?';
      queryParams.push(filters.dev_eui);
    }
    if (filters.start_date) {
      const timestampColumn = tableName === 'device_events_management' ? 'event_timestamp' :
                               tableName === 'device_configuration_management' ? 'config_timestamp' : 
                               'timestamp';
      whereClause += ` AND ${timestampColumn} >= ?`;
      queryParams.push(filters.start_date);
    }
    if (filters.end_date) {
      const timestampColumn = tableName === 'device_events_management' ? 'event_timestamp' :
                               tableName === 'device_configuration_management' ? 'config_timestamp' : 
                               'timestamp';
      whereClause += ` AND ${timestampColumn} <= ?`;
      queryParams.push(filters.end_date);
    }
    if (filters.customer_name) {
      whereClause += ' AND customer_name LIKE ?';
      queryParams.push(`%${filters.customer_name}%`);
    }
  }

  const [rows] = await xfinderdb_prod.query<RowDataPacket[]>(
    `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT 10000`,
    queryParams
  );

  if (format === 'csv') {
    // Convert to CSV
    if (rows.length === 0) return '';
    
    const headers = Object.keys(rows[0]).join(',');
    const csvRows = rows.map(row => 
      Object.values(row).map(val => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );
    
    return [headers, ...csvRows].join('\n');
  }

  return rows; // JSON format
};