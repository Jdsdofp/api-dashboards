// src/services/geoLocationsMetricsService.ts
import { pool } from '../db/mysql';
import { RowDataPacket } from 'mysql2';

interface LocationMetric extends RowDataPacket {
  zone_code: string;
  zone_name: string;
  item_id: string;
  item_name: string;
  item_type: string;
  latitude: number;
  longitude: number;
  distance_moved: number;
  movement_category: string;
  geofence_status: string;
  alert_status: string;
  alert_severity_score: number;
  activity_status: string;
  last_seen_timestamp: string;
  minutes_since_last_seen: number;
  hours_since_last_seen: number;
  company_id: number;
  company_name: string;
  site_code: string;
  site_name: string;
}

export const getGeoLocationMetrics = async (companyId: number) => {
  const [rows] = await pool.query<LocationMetric[]>(`
    SELECT *
    FROM superview_geo_location_metrics
    WHERE company_id = ?
    ORDER BY event_timestamp DESC
    LIMIT 100;
  `, [companyId]);

  if (!rows.length) return null;

  // =====================
  // 🔍 Agrupamento por zona
  // =====================
  const zonesMap = new Map<string, any>();
  let totalAlerts = 0, offlineItems = 0, stationary = 0, moving = 0, totalDistance = 0;

  for (const r of rows) {
    const zoneKey = r.zone_code || 'UNKNOWN';

    if (!zonesMap.has(zoneKey)) {
      zonesMap.set(zoneKey, {
        zone_code: r.zone_code,
        zone_name: r.zone_name,
        items: []
      });
    }

    zonesMap.get(zoneKey).items.push({
      id: r.item_id,
      name: r.item_name,
      type: r.item_type,
      location: {
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        distance_moved_m: r.distance_moved || 0,
        movement_category: r.movement_category,
        last_seen: r.last_seen_timestamp,
        hours_since_last_seen: r.hours_since_last_seen
      },
      alerts: {
        active: r.alert_status === 'ALERT_ACTIVE',
        severity_score: r.alert_severity_score,
        geofence_status: r.geofence_status
      },
      metrics: {
        activity_status: r.activity_status
      }
    });

    if (r.alert_status === 'ALERT_ACTIVE') totalAlerts++;
    if (r.activity_status === 'OFFLINE') offlineItems++;
    if (r.movement_category === 'STATIONARY') stationary++;
    else moving++;
    totalDistance += r.distance_moved || 0;
  }

  const avgDistance = totalDistance / rows.length;

  // =====================
  // 📈 Métricas Analíticas
  // =====================
  const analytics = {
    total_items: rows.length,
    active_alerts: totalAlerts,
    offline_items: offlineItems,
    avg_distance_moved: avgDistance,
    movement_distribution: { stationary, moving },
    alerts_by_zone: Array.from(zonesMap.values()).map(z => ({
      zone_name: z.zone_name,
      alert_count: z.items.filter((i: any) => i.alerts.active).length
    }))
  };

  // =====================
  // 🧩 Estrutura final
  // =====================
  return {
    company: {
      id: rows[0].company_id,
      name: rows[0].company_name
    },
    site: {
      code: rows[0].site_code,
      name: rows[0].site_name,
      zones: Array.from(zonesMap.values())
    },
    analytics
  };
};
