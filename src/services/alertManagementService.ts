// src/services/alertManagementService.ts
import { xfinderdb_prod } from '../db/xfinderdb_prod';
import { RowDataPacket } from 'mysql2';

// =====================================
// 🚨 INTERFACES - ALERTS & MONITORING
// =====================================

interface AlertSummary extends RowDataPacket {
  total_people: number;
  alarm1_active: number;
  alarm2_active: number;
  any_alarm_active: number;
  button1_pressed: number;
  button2_pressed: number;
  any_button_pressed: number;
  mandown_alerts: number;
  people_with_alerts: number;
  highly_critical: number;
  critical: number;
  alerts: number;
}

interface PersonAlert extends RowDataPacket {
  person_code: string;
  person_name: string;
  dev_uid: string;
  department_name: string;
  current_zone_description: string;
  alarm2_status: string;
  alarm2_last_updated: string;
  alarm2_minutes_ago: number;
  status_name: string;
  battery_level: number;
  last_report_datetime: string;
  alert_priority: string;
  alert_score: number;
}

interface ButtonComparison extends RowDataPacket {
  button_type: string;
  pressed: number;
  not_pressed: number;
  avg_minutes_since_press: number;
}

interface AlarmComparison extends RowDataPacket {
  alarm_type: string;
  active: number;
  inactive: number;
  avg_minutes_active: number;
}

interface AllActiveAlerts extends RowDataPacket {
  person_code: string;
  person_name: string;
  dev_uid: string;
  department_name: string;
  role_name: string;
  current_zone_description: string;
  alarm1_status: string;
  alarm1_minutes_ago: number;
  alarm2_status: string;
  alarm2_minutes_ago: number;
  button1_status: string;
  button1_minutes_ago: number;
  button2_status: string;
  button2_minutes_ago: number;
  mandown_alert_status: string;
  mandown_alert_last_updated: number;
  alert_priority: string;
  alert_score: number;
  status_name: string;
  battery_level: number;
  last_report_datetime: string;
  minutes_since_report: number;
}

interface AlertHistory extends RowDataPacket {
  person_code: string;
  person_name: string;
  alarm1_status: string;
  alarm1_changed_at: string;
  alarm1_changed_minutes_ago: number;
  alarm2_status: string;
  alarm2_changed_at: string;
  alarm2_changed_minutes_ago: number;
  button1_status: string;
  button1_changed_at: string;
  button1_changed_minutes_ago: number;
  button2_status: string;
  button2_changed_at: string;
  button2_changed_minutes_ago: number;
  current_zone_description: string;
}

interface AlertsByDepartment extends RowDataPacket {
  department_name: string;
  total_people: number;
  alarm1_count: number;
  alarm2_count: number;
  button1_count: number;
  button2_count: number;
  mandown_count: number;
  total_alerts: number;
  alert_percentage: number;
}

interface AlertsByZone extends RowDataPacket {
  zone: string;
  total_people: number;
  alarm1: number;
  alarm2: number;
  button1: number;
  button2: number;
  mandown: number;
  total_alerts: number;
  alert_density: number;
  avg_alert_score: number;
}

interface MultipleAlerts extends RowDataPacket {
  person_code: string;
  person_name: string;
  dev_uid: string;
  department_name: string;
  current_zone_description: string;
  active_alerts_count: number;
  active_alerts_list: string;
  alert_priority: string;
  alert_score: number;
  battery_level: number;
  last_report_datetime: string;
}

// =====================================
// 🚨 ALERT MANAGEMENT FUNCTIONS
// =====================================

/**
 * 1. RESUMO DE ALERTAS - Incluindo Button2 e Alarm2
 */
export const getAlertSummary = async (companyId: string): Promise<AlertSummary | null> => {
  const query = `
    SELECT 
      COUNT(*) AS total_people,
      
      -- Alarmes
      SUM(CASE WHEN alarm1_status = 'ON' THEN 1 ELSE 0 END) AS alarm1_active,
      SUM(CASE WHEN alarm2_status = 'ON' THEN 1 ELSE 0 END) AS alarm2_active,
      SUM(CASE WHEN alarm1_status = 'ON' OR alarm2_status = 'ON' THEN 1 ELSE 0 END) AS any_alarm_active,
      
      -- Botões
      SUM(CASE WHEN button1_status = 'ON' THEN 1 ELSE 0 END) AS button1_pressed,
      SUM(CASE WHEN button2_status = 'ON' THEN 1 ELSE 0 END) AS button2_pressed,
      SUM(CASE WHEN button1_status = 'ON' OR button2_status = 'ON' THEN 1 ELSE 0 END) AS any_button_pressed,
      
      -- Man-Down
      SUM(CASE WHEN mandown_alert_status = 'ON' THEN 1 ELSE 0 END) AS mandown_alerts,
      
      -- Qualquer alerta
      SUM(has_any_alert) AS people_with_alerts,
      
      -- Prioridades
      SUM(CASE WHEN alert_priority = 'HIGHLY_CRITICAL' THEN 1 ELSE 0 END) AS highly_critical,
      SUM(CASE WHEN alert_priority = 'CRITICAL' THEN 1 ELSE 0 END) AS critical,
      SUM(CASE WHEN alert_priority = 'ALERT' THEN 1 ELSE 0 END) AS alerts

    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
  `;

  try {
    const [rows] = await xfinderdb_prod.query<AlertSummary[]>(query, [companyId]);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error in getAlertSummary:', error);
    throw error;
  }
};

/**
 * 2. LISTA DE PESSOAS COM ALARM2 ATIVO
 */
export const getPeopleWithAlarm2Active = async (companyId: string): Promise<PersonAlert[]> => {
  const query = `
    SELECT 
      person_code,
      person_name,
      dev_uid,
      department_name,
      current_zone_description,
      
      alarm2_status,
      alarm2_last_updated,
      alarm2_minutes_ago,
      
      status_name,
      battery_level,
      last_report_datetime,
      alert_priority,
      alert_score

    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
      AND alarm2_status = 'ON'
    ORDER BY alarm2_minutes_ago ASC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<PersonAlert[]>(query, [companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getPeopleWithAlarm2Active:', error);
    throw error;
  }
};

/**
 * 3. LISTA DE PESSOAS COM BUTTON2 PRESSIONADO
 */
export const getPeopleWithButton2Pressed = async (companyId: string): Promise<PersonAlert[]> => {
  const query = `
    SELECT 
      person_code,
      person_name,
      dev_uid,
      department_name,
      current_zone_description,
      
      button2_status,
      button2_last_updated,
      button2_minutes_ago,
      
      status_name,
      battery_level,
      last_report_datetime

    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
      AND button2_status = 'ON'
    ORDER BY button2_minutes_ago ASC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<PersonAlert[]>(query, [companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getPeopleWithButton2Pressed:', error);
    throw error;
  }
};

/**
 * 4. COMPARATIVO DE BOTÕES (Gráfico de Barras)
 */
export const getButtonComparison = async (companyId: string): Promise<ButtonComparison[]> => {
  const query = `
    SELECT 
      'Button 1' AS button_type,
      SUM(CASE WHEN button1_status = 'ON' THEN 1 ELSE 0 END) AS pressed,
      SUM(CASE WHEN button1_status = 'OFF' THEN 1 ELSE 0 END) AS not_pressed,
      ROUND(AVG(CASE WHEN button1_status = 'ON' THEN button1_minutes_ago END), 1) AS avg_minutes_since_press
    FROM echart_people_sensor_monitoring
    WHERE company_id = ?

    UNION ALL

    SELECT 
      'Button 2' AS button_type,
      SUM(CASE WHEN button2_status = 'ON' THEN 1 ELSE 0 END) AS pressed,
      SUM(CASE WHEN button2_status = 'OFF' THEN 1 ELSE 0 END) AS not_pressed,
      ROUND(AVG(CASE WHEN button2_status = 'ON' THEN button2_minutes_ago END), 1) AS avg_minutes_since_press
    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
  `;

  try {
    const [rows] = await xfinderdb_prod.query<ButtonComparison[]>(query, [companyId, companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getButtonComparison:', error);
    throw error;
  }
};

/**
 * 5. COMPARATIVO DE ALARMES (Gráfico de Barras)
 */
export const getAlarmComparison = async (companyId: string): Promise<AlarmComparison[]> => {
  const query = `
    SELECT 
      'Alarm 1' AS alarm_type,
      SUM(CASE WHEN alarm1_status = 'ON' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN alarm1_status = 'OFF' THEN 1 ELSE 0 END) AS inactive,
      ROUND(AVG(CASE WHEN alarm1_status = 'ON' THEN alarm1_minutes_ago END), 1) AS avg_minutes_active
    FROM echart_people_sensor_monitoring
    WHERE company_id = ?

    UNION ALL

    SELECT 
      'Alarm 2' AS alarm_type,
      SUM(CASE WHEN alarm2_status = 'ON' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN alarm2_status = 'OFF' THEN 1 ELSE 0 END) AS inactive,
      ROUND(AVG(CASE WHEN alarm2_status = 'ON' THEN alarm2_minutes_ago END), 1) AS avg_minutes_active
    FROM echart_people_sensor_monitoring
    WHERE company_id = ?

    UNION ALL

    SELECT 
      'Man-Down' AS alarm_type,
      SUM(CASE WHEN mandown_alert_status = 'ON' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN mandown_alert_status = 'OFF' THEN 1 ELSE 0 END) AS inactive,
      ROUND(AVG(CASE WHEN mandown_alert_status = 'ON' THEN mandown_alert_last_updated END), 1) AS avg_minutes_active
    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
  `;

  try {
    const [rows] = await xfinderdb_prod.query<AlarmComparison[]>(query, [companyId, companyId, companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getAlarmComparison:', error);
    throw error;
  }
};

/**
 * 6. TODOS OS ALERTAS ATIVOS (Completo)
 */
export const getAllActiveAlerts = async (companyId: string): Promise<AllActiveAlerts[]> => {
  const query = `
    SELECT 
      person_code,
      person_name,
      dev_uid,
      department_name,
      role_name,
      current_zone_description,
      
      -- Status de todos os alertas
      alarm1_status,
      alarm1_minutes_ago,
      alarm2_status,
      alarm2_minutes_ago,
      button1_status,
      button1_minutes_ago,
      button2_status,
      button2_minutes_ago,
      mandown_alert_status,
      mandown_alert_last_updated,
      
      -- Prioridade
      alert_priority,
      alert_score,
      
      -- Status da pessoa
      status_name,
      battery_level,
      last_report_datetime,
      minutes_since_report

    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
      AND has_any_alert = 1  -- Apenas pessoas com algum alerta ativo
    ORDER BY alert_score DESC, minutes_since_report ASC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<AllActiveAlerts[]>(query, [companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getAllActiveAlerts:', error);
    throw error;
  }
};

/**
 * 7. HISTÓRICO DE MUDANÇAS DE ALARMES (Timeline - últimas 24h)
 */
export const getAlertHistory24h = async (companyId: string): Promise<AlertHistory[]> => {
  const query = `
    SELECT 
      person_code,
      person_name,
      
      -- Alarm 1
      alarm1_status,
      alarm1_last_changed AS alarm1_changed_at,
      TIMESTAMPDIFF(MINUTE, alarm1_last_changed, NOW()) AS alarm1_changed_minutes_ago,
      
      -- Alarm 2
      alarm2_status,
      alarm2_last_changed AS alarm2_changed_at,
      TIMESTAMPDIFF(MINUTE, alarm2_last_changed, NOW()) AS alarm2_changed_minutes_ago,
      
      -- Button 1
      button1_status,
      button1_last_changed AS button1_changed_at,
      TIMESTAMPDIFF(MINUTE, button1_last_changed, NOW()) AS button1_changed_minutes_ago,
      
      -- Button 2
      button2_status,
      button2_last_changed AS button2_changed_at,
      TIMESTAMPDIFF(MINUTE, button2_last_changed, NOW()) AS button2_changed_minutes_ago,
      
      current_zone_description

    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
      AND (
        alarm1_last_changed >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        OR alarm2_last_changed >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        OR button1_last_changed >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        OR button2_last_changed >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      )
    ORDER BY 
      GREATEST(
        COALESCE(alarm1_last_changed, '1970-01-01'),
        COALESCE(alarm2_last_changed, '1970-01-01'),
        COALESCE(button1_last_changed, '1970-01-01'),
        COALESCE(button2_last_changed, '1970-01-01')
      ) DESC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<AlertHistory[]>(query, [companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getAlertHistory24h:', error);
    throw error;
  }
};

/**
 * 8. DISTRIBUIÇÃO DE ALERTAS POR DEPARTAMENTO
 */
export const getAlertsByDepartment = async (companyId: string): Promise<AlertsByDepartment[]> => {
  const query = `
    SELECT 
      department_name,
      COUNT(*) AS total_people,
      
      SUM(CASE WHEN alarm1_status = 'ON' THEN 1 ELSE 0 END) AS alarm1_count,
      SUM(CASE WHEN alarm2_status = 'ON' THEN 1 ELSE 0 END) AS alarm2_count,
      SUM(CASE WHEN button1_status = 'ON' THEN 1 ELSE 0 END) AS button1_count,
      SUM(CASE WHEN button2_status = 'ON' THEN 1 ELSE 0 END) AS button2_count,
      SUM(CASE WHEN mandown_alert_status = 'ON' THEN 1 ELSE 0 END) AS mandown_count,
      
      SUM(has_any_alert) AS total_alerts,
      
      ROUND(SUM(has_any_alert) * 100.0 / COUNT(*), 2) AS alert_percentage

    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
      AND department_name != ''
    GROUP BY department_name
    ORDER BY total_alerts DESC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<AlertsByDepartment[]>(query, [companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getAlertsByDepartment:', error);
    throw error;
  }
};

/**
 * 9. ALERTAS POR ZONA (Heatmap)
 */
export const getAlertsByZone = async (companyId: string): Promise<AlertsByZone[]> => {
  const query = `
    SELECT 
      current_zone_description AS zone,
      COUNT(*) AS total_people,
      
      SUM(CASE WHEN alarm1_status = 'ON' THEN 1 ELSE 0 END) AS alarm1,
      SUM(CASE WHEN alarm2_status = 'ON' THEN 1 ELSE 0 END) AS alarm2,
      SUM(CASE WHEN button1_status = 'ON' THEN 1 ELSE 0 END) AS button1,
      SUM(CASE WHEN button2_status = 'ON' THEN 1 ELSE 0 END) AS button2,
      SUM(CASE WHEN mandown_alert_status = 'ON' THEN 1 ELSE 0 END) AS mandown,
      
      SUM(has_any_alert) AS total_alerts,
      
      ROUND(SUM(has_any_alert) * 100.0 / COUNT(*), 1) AS alert_density,
      
      ROUND(AVG(alert_score), 1) AS avg_alert_score

    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
      AND current_zone_description IS NOT NULL
    GROUP BY current_zone_description
    HAVING total_people > 0
    ORDER BY alert_density DESC, total_alerts DESC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<AlertsByZone[]>(query, [companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getAlertsByZone:', error);
    throw error;
  }
};

/**
 * 10. PESSOAS COM MÚLTIPLOS ALERTAS SIMULTÂNEOS
 */
export const getPeopleWithMultipleAlerts = async (companyId: string): Promise<MultipleAlerts[]> => {
  const query = `
    SELECT 
      person_code,
      person_name,
      dev_uid,
      department_name,
      current_zone_description,
      
      -- Contagem de alertas ativos
      (COALESCE(alarm1_numeric, 0) + COALESCE(alarm2_numeric, 0) + 
       COALESCE(button1_numeric, 0) + COALESCE(button2_numeric, 0) + 
       COALESCE(mandown_alert_numeric, 0)) AS active_alerts_count,
      
      -- Status de cada alerta
      CONCAT_WS(', ',
        CASE WHEN alarm1_status = 'ON' THEN 'ALARM1' END,
        CASE WHEN alarm2_status = 'ON' THEN 'ALARM2' END,
        CASE WHEN button1_status = 'ON' THEN 'BUTTON1' END,
        CASE WHEN button2_status = 'ON' THEN 'BUTTON2' END,
        CASE WHEN mandown_alert_status = 'ON' THEN 'MANDOWN' END
      ) AS active_alerts_list,
      
      alert_priority,
      alert_score,
      battery_level,
      last_report_datetime

    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
      AND has_any_alert = 1
    HAVING active_alerts_count > 1  -- Apenas múltiplos alertas
    ORDER BY active_alerts_count DESC, alert_score DESC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<MultipleAlerts[]>(query, [companyId]);
    return rows;
  } catch (error) {
    console.error('❌ Error in getPeopleWithMultipleAlerts:', error);
    throw error;
  }
};

// =====================================
// 🔍 FUNÇÕES AUXILIARES COM FILTROS
// =====================================

/**
 * Buscar pessoas com alertas específicos
 */
interface AlertFilters {
  alarm1?: boolean;
  alarm2?: boolean;
  button1?: boolean;
  button2?: boolean;
  mandown?: boolean;
  department?: string;
  zone?: string;
  priority?: 'HIGHLY_CRITICAL' | 'CRITICAL' | 'ALERT';
}

export const getPeopleWithAlerts = async (
  companyId: string,
  filters: AlertFilters = {}
): Promise<AllActiveAlerts[]> => {
  let whereConditions = ['company_id = ?'];
  const params: any[] = [companyId];

  // Construir condições baseadas nos filtros
  const alertConditions: string[] = [];
  
  if (filters.alarm1) alertConditions.push("alarm1_status = 'ON'");
  if (filters.alarm2) alertConditions.push("alarm2_status = 'ON'");
  if (filters.button1) alertConditions.push("button1_status = 'ON'");
  if (filters.button2) alertConditions.push("button2_status = 'ON'");
  if (filters.mandown) alertConditions.push("mandown_alert_status = 'ON'");

  if (alertConditions.length > 0) {
    whereConditions.push(`(${alertConditions.join(' OR ')})`);
  }

  if (filters.department) {
    whereConditions.push('department_name = ?');
    params.push(filters.department);
  }

  if (filters.zone) {
    whereConditions.push('current_zone_description = ?');
    params.push(filters.zone);
  }

  if (filters.priority) {
    whereConditions.push('alert_priority = ?');
    params.push(filters.priority);
  }

  const query = `
    SELECT 
      person_code,
      person_name,
      dev_uid,
      department_name,
      role_name,
      current_zone_description,
      alarm1_status,
      alarm1_minutes_ago,
      alarm2_status,
      alarm2_minutes_ago,
      button1_status,
      button1_minutes_ago,
      button2_status,
      button2_minutes_ago,
      mandown_alert_status,
      mandown_alert_last_updated,
      alert_priority,
      alert_score,
      status_name,
      battery_level,
      last_report_datetime,
      minutes_since_report
    FROM echart_people_sensor_monitoring
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY alert_score DESC, minutes_since_report ASC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<AllActiveAlerts[]>(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Error in getPeopleWithAlerts:', error);
    throw error;
  }
};

/**
 * Obter histórico de alertas com período customizado
 */
export const getAlertHistoryCustomPeriod = async (
  companyId: string,
  hours: number = 24
): Promise<AlertHistory[]> => {
  const query = `
    SELECT 
      person_code,
      person_name,
      alarm1_status,
      alarm1_last_changed AS alarm1_changed_at,
      TIMESTAMPDIFF(MINUTE, alarm1_last_changed, NOW()) AS alarm1_changed_minutes_ago,
      alarm2_status,
      alarm2_last_changed AS alarm2_changed_at,
      TIMESTAMPDIFF(MINUTE, alarm2_last_changed, NOW()) AS alarm2_changed_minutes_ago,
      button1_status,
      button1_last_changed AS button1_changed_at,
      TIMESTAMPDIFF(MINUTE, button1_last_changed, NOW()) AS button1_changed_minutes_ago,
      button2_status,
      button2_last_changed AS button2_changed_at,
      TIMESTAMPDIFF(MINUTE, button2_last_changed, NOW()) AS button2_changed_minutes_ago,
      current_zone_description
    FROM echart_people_sensor_monitoring
    WHERE company_id = ?
      AND (
        alarm1_last_changed >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        OR alarm2_last_changed >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        OR button1_last_changed >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        OR button2_last_changed >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      )
    ORDER BY 
      GREATEST(
        COALESCE(alarm1_last_changed, '1970-01-01'),
        COALESCE(alarm2_last_changed, '1970-01-01'),
        COALESCE(button1_last_changed, '1970-01-01'),
        COALESCE(button2_last_changed, '1970-01-01')
      ) DESC
  `;

  try {
    const [rows] = await xfinderdb_prod.query<AlertHistory[]>(
      query,
      [companyId, hours, hours, hours, hours]
    );
    return rows;
  } catch (error) {
    console.error('❌ Error in getAlertHistoryCustomPeriod:', error);
    throw error;
  }
};

// =====================================
// 📊 EXPORT DE ALERTAS
// =====================================

/**
 * Exportar dados de alertas para CSV/JSON
 */
export const exportAlertsData = async (
  companyId: string,
  format: 'json' | 'csv',
  filters?: AlertFilters
): Promise<any> => {
  const data = await getPeopleWithAlerts(companyId, filters);

  if (format === 'csv') {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const csvRows = data.map(row =>
      Object.values(row)
        .map(val => {
          if (val === null || val === undefined) return '';
          if (
            typeof val === 'string' &&
            (val.includes(',') || val.includes('"') || val.includes('\n'))
          ) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(',')
    );

    return [headers, ...csvRows].join('\n');
  }

  return data; // JSON format
};