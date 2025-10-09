// src/services/certificateAnalyticsService.ts
import { pool } from '../db/mysql';
import { RowDataPacket } from 'mysql2';

interface CertificateRow extends RowDataPacket {
  expiration_date: string;
  certificate_status_name: string;
  combined_risk_score: number;
  department_name: string;
  certificate_type: string;
  financial_risk_value: number; // Certifique-se que é number
  renewal_probability_score: number;
  issue_date: string;
  brand: string;
  expiration_risk_score: number;
  days_until_expiration: number;
  validity_status: string;
  company_id: number;
}

interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ReportRow extends RowDataPacket {
  item_name: string;
  certificate_type: string;
  certificate_description: string;
  category_name: string;
  certificate_status_name: string;
  validity_status: string;
  issuer_company_name: string;
  Home_Area_city: string;
  Home_Area_State: string;
  Home_site_name: string;
  
  // Campos analíticos adicionados
  days_until_expiration: number;
  expiration_date: Date;
  renewal_urgency_level: string;
  combined_risk_score: number;
  compliance_score: number;
  operational_impact_score: number;
  
  // Campos de recomendação IA
  ai_recommendation: string;
  recommended_action: string;
  action_priority: number;
  needs_immediate_action: boolean;
  
  // Campos de certificação
  recertification_probability: number;
  renewal_probability_score: number;
  expiration_risk_score: number;
  
  // Campos de custo e valor
  asset_value_at_risk: number;
  financial_risk_value: number;
  purchase_cost: number;
  purchase_currency: string;
  
  // Campos de automação e padrões
  automation_candidate: boolean;
  automation_readiness_score: number;
  pattern_confidence_score: number;
  
  // Campos de tendência
  trend_direction: string;
  risk_trend: string;
  
  // Informações do item
  item_code: string;
  brand: string;
  model: string;
  serial: string;
  
  // Responsável
  custody_name: string;
  custody_email: string;
  
  // Flags úteis
  is_expiring_this_week: boolean;
  is_expiring_90_days: boolean;
  is_expired: boolean;
  is_high_value_asset: boolean;
  is_critical_compliance: boolean;
}

export const getCertificateAnalyticsByCompany = async (companyId: number) => {
  const [rows] = await pool.query<CertificateRow[]>(`
    SELECT 
      expiration_date,
      certificate_status_name,
      combined_risk_score,
      department_name,
      certificate_type,
      CAST(financial_risk_value AS DECIMAL(10,2)) as financial_risk_value,
      renewal_probability_score,
      issue_date,
      brand,
      expiration_risk_score,
      days_until_expiration,
      validity_status,
      company_id
    FROM mat_view_prod.predictive_certificate_analysis
    WHERE company_id = ?
  `, [companyId]);

  const data = rows as CertificateRow[];

  if (data.length === 0) {
    return {
      analytics: {
        totalCertificates: 0,
        validCertificates: 0,
        expiredCertificates: 0,
        expiringSoon: 0,
        expiring90Days: 0,
        averageRenewalScore: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        totalFinancialRisk: 0
      },
      statusData: [],
      riskData: [],
      brandsData: [],
      trendsData: [],
      expirationByMonth: {},
      departments: [],
      certificateTypes: [],
      daysToExpirationRanges: {
        under_minus_200: 0,
        minus_200_to_minus_100: 0,
        minus_100_to_minus_50: 0,
        minus_50_to_0: 0,
        zero_to_50: 0,
        range_50_to_100: 0,
        over_100: 0
      },
      processedData: {
        total: 0,
        expired: 0,
        approved: 0,
        expiring90Days: 0,
        expiringSoon: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        totalFinancialRisk: 0,
        avgRenewalProbability: 0,
        departments: [],
        certificateTypes: [],
        expirationByMonth: {},
        daysToExpirationRanges: {
          under_minus_200: 0,
          minus_200_to_minus_100: 0,
          minus_100_to_minus_50: 0,
          minus_50_to_0: 0,
          zero_to_50: 0,
          range_50_to_100: 0,
          over_100: 0
        }
      }
    };
  }

  const now = Date.now();

  // ============= MÉTRICAS GERAIS =============
  const totalCertificates = data.length;
  const validCertificates = data.filter(d => d.certificate_status_name === 'APPROVED').length;
  const expiredCertificates = data.filter(d => d.certificate_status_name === 'EXPIRED').length;
  const expiringSoon = data.filter(d => d.days_until_expiration <= 30 && d.days_until_expiration > 0).length;
  const expiring90Days = data.filter(d => d.days_until_expiration <= 90 && d.days_until_expiration > 0).length;

  const averageRenewalScore = totalCertificates > 0
    ? data.reduce((sum, d) => sum + (d.renewal_probability_score || 0), 0) / totalCertificates
    : 0;

  // ============= DISTRIBUIÇÃO DE STATUS =============
  const statusData = [
    { name: 'Expired', value: expiredCertificates },
    { name: 'Approved', value: validCertificates },
    { name: 'Expiring Soon', value: expiringSoon }
  ];

  // ============= DISTRIBUIÇÃO DE RISCO =============
  const highRisk = data.filter(d => d.combined_risk_score >= 60).length;
  const mediumRisk = data.filter(d => d.combined_risk_score >= 30 && d.combined_risk_score < 60).length;
  const lowRisk = data.filter(d => d.combined_risk_score < 30).length;

  const riskData = [
    { name: 'Baixo', value: lowRisk },
    { name: 'Médio', value: mediumRisk },
    { name: 'Alto', value: highRisk }
  ];

  // ============= TOP 5 MARCAS =============
  const brandMap = new Map<string, number>();
  data.forEach(d => {
    if (d.brand) {
      brandMap.set(d.brand, (brandMap.get(d.brand) || 0) + 1);
    }
  });
  const brandsData = Array.from(brandMap, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // ============= TENDÊNCIA TEMPORAL (EMISSÕES POR MÊS) =============
  const monthlyMap = new Map<string, number>();
  data.forEach(d => {
    if (d.issue_date) {
      const month = new Date(d.issue_date).toISOString().slice(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    }
  });
  const trendsData = Array.from(monthlyMap, ([month, issued]) => ({ month, issued }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // ============= EXPIRAÇÕES POR MÊS - CORRIGIDO =============
  const expirationByMonth: { [key: number]: any } = {};
  

  // ============= TENDÊNCIA DE RENOVAÇÃO (6 SEMANAS) =============
  // const now = Date.now();
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  
  const renewalTrend = {
    urgent: [] as number[],
    planned: [] as number[],
    future: [] as number[]
  };

  // Calcular para as próximas 6 semanas
  for (let week = 1; week <= 6; week++) {
    const weekStart = now + ((week - 1) * weekInMs);
    const weekEnd = now + (week * weekInMs);

    // Urgente: certificados que expiram nesta semana ou já expiraram
    const urgent = data.filter(d => {
      const expDate = parseInt(d.expiration_date);
      return d.days_until_expiration <= (week * 7) && d.certificate_status_name === 'EXPIRED';
    }).length;

    // Planejado: certificados que expiram em 1-3 meses
    const planned = data.filter(d => {
      const daysToExp = d.days_until_expiration;
      return daysToExp > 0 && daysToExp <= 90 && daysToExp > 30;
    }).length;

    // Futuro: certificados que expiram em mais de 3 meses
    const future = data.filter(d => {
      const daysToExp = d.days_until_expiration;
      return daysToExp > 90;
    }).length;

    renewalTrend.urgent.push(urgent);
    renewalTrend.planned.push(planned);
    renewalTrend.future.push(future);
  }



  data.forEach(d => {
    if (d.expiration_date) {
      // Tentar parse do timestamp
      let date: Date;
      const timestamp = parseInt(d.expiration_date);
      
      // Se for um timestamp válido (em milissegundos)
      if (!isNaN(timestamp) && timestamp > 0) {
        date = new Date(timestamp);
      } else {
        // Tentar parse como string de data
        date = new Date(d.expiration_date);
      }
      
      // Verificar se a data é válida
      if (!isNaN(date.getTime())) {
        const monthKey = date.getMonth(); // 0-11
        
        if (!expirationByMonth[monthKey]) {
          expirationByMonth[monthKey] = {
            expired: 0,
            expiring_0_30: 0,
            expiring_31_90: 0,
            valid: 0
          };
        }

        if (d.certificate_status_name === 'EXPIRED') {
          expirationByMonth[monthKey].expired++;
        } else if (d.days_until_expiration > 0 && d.days_until_expiration <= 30) {
          expirationByMonth[monthKey].expiring_0_30++;
        } else if (d.days_until_expiration > 30 && d.days_until_expiration <= 90) {
          expirationByMonth[monthKey].expiring_31_90++;
        } else if (d.days_until_expiration > 90) {
          expirationByMonth[monthKey].valid++;
        }
      }
    }
  });

  // ============= DEPARTAMENTOS =============
  const deptMap = new Map<string, { count: number; expired: number }>();
  data.forEach(d => {
    if (d.department_name) {
      const current = deptMap.get(d.department_name) || { count: 0, expired: 0 };
      current.count++;
      if (d.certificate_status_name === 'EXPIRED') {
        current.expired++;
      }
      deptMap.set(d.department_name, current);
    }
  });

  const departments = Array.from(deptMap, ([name, stats]) => ({
    name,
    count: stats.count,
    expired: stats.expired
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ============= TIPOS DE CERTIFICADO =============
  const typeMap = new Map<string, { count: number; expired: number }>();
  data.forEach(d => {
    if (d.certificate_type) {
      const current = typeMap.get(d.certificate_type) || { count: 0, expired: 0 };
      current.count++;
      if (d.certificate_status_name === 'EXPIRED') {
        current.expired++;
      }
      typeMap.set(d.certificate_type, current);
    }
  });

  const certificateTypes = Array.from(typeMap, ([name, stats]) => ({
    name,
    count: stats.count,
    expired: stats.expired
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ============= DIAS ATÉ EXPIRAÇÃO (RANGES) =============
  const daysToExpirationRanges = {
    under_minus_200: 0,
    minus_200_to_minus_100: 0,
    minus_100_to_minus_50: 0,
    minus_50_to_0: 0,
    zero_to_50: 0,
    range_50_to_100: 0,
    over_100: 0
  };

  data.forEach(d => {
    const days = d.days_until_expiration;
    if (days < -200) daysToExpirationRanges.under_minus_200++;
    else if (days >= -200 && days < -100) daysToExpirationRanges.minus_200_to_minus_100++;
    else if (days >= -100 && days < -50) daysToExpirationRanges.minus_100_to_minus_50++;
    else if (days >= -50 && days < 0) daysToExpirationRanges.minus_50_to_0++;
    else if (days >= 0 && days < 50) daysToExpirationRanges.zero_to_50++;
    else if (days >= 50 && days < 100) daysToExpirationRanges.range_50_to_100++;
    else daysToExpirationRanges.over_100++;
  });

  // ============= RISCO FINANCEIRO TOTAL - CORRIGIDO =============
  const totalFinancialRisk = data.reduce((sum, d) => {
    // Garantir que financial_risk_value seja tratado como número
    const value = parseFloat(String(d.financial_risk_value || 0));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

// ============= EVENTOS DO CALENDÁRIO =============
const calendarEvents = data.map((cert, index) => {
  const timestamp = parseInt(cert.expiration_date);
  let expirationDate: Date;
  
  if (!isNaN(timestamp) && timestamp > 0) {
    expirationDate = new Date(timestamp);
  } else {
    expirationDate = new Date(cert.expiration_date);
  }
  
  // Validar se a data é válida
  if (isNaN(expirationDate.getTime())) {
    console.warn(`Invalid date for certificate ${index}:`, cert.expiration_date);
    return null;
  }
  
  // Determinar cor baseado no status
  let color = '#10b981'; // verde para aprovado
  if (cert.certificate_status_name === 'EXPIRED') {
    color = '#ef4444'; // vermelho para expirado
  } else if (cert.days_until_expiration <= 30 && cert.days_until_expiration > 0) {
    color = '#f97316'; // laranja para expirando em breve
  } else if (cert.days_until_expiration <= 90 && cert.days_until_expiration > 30) {
    color = '#fbbf24'; // amarelo para expirando em 90 dias
  }

  return {
    id: `cert-${index}-${Date.now()}`,
    title: `${cert.certificate_type || 'Certificate'} - ${cert.department_name || 'N/A'}`,
    start: expirationDate.toISOString().split('T')[0],
    color: color,
    extendedProps: {
      status: cert.certificate_status_name,
      department: cert.department_name,
      brand: cert.brand,
      daysToExpiration: cert.days_until_expiration,
      riskScore: cert.combined_risk_score,
      issueDate: cert.issue_date ? new Date(cert.issue_date).toISOString().split('T')[0] : null
    }
  };
}).filter(event => event !== null); // Remover eventos inválidos

  // ============= RETORNO COMPLETO =============
  return {
    analytics: {
      totalCertificates,
      validCertificates,
      expiredCertificates,
      expiringSoon,
      expiring90Days,
      averageRenewalScore: Number(averageRenewalScore.toFixed(2)),
      highRisk,
      mediumRisk,
      lowRisk,
      totalFinancialRisk: Number(totalFinancialRisk.toFixed(2))
    },
    statusData,
    riskData,
    brandsData,
    trendsData,
    expirationByMonth,
    departments,
    certificateTypes,
    daysToExpirationRanges,
    renewalTrend, 
    calendarEvents,
    processedData: {
      total: totalCertificates,
      expired: expiredCertificates,
      approved: validCertificates,
      expiring90Days,
      expiringSoon,
      highRisk,
      mediumRisk,
      lowRisk,
      totalFinancialRisk: Number(totalFinancialRisk.toFixed(2)),
      avgRenewalProbability: Number(averageRenewalScore.toFixed(2)),
      departments,
      certificateTypes,
      expirationByMonth,
      daysToExpirationRanges,
      renewalTrend,
      calendarEvents 
    }
  };
};

export const getReportsCertificateAnalyticsByCompany = async (
  companyId: number,
  params: PaginationParams
): Promise<PaginatedResponse<ReportRow>> => {
  const { page = 1, limit = 10, sortBy = 'action_priority', sortOrder = 'DESC' } = params;

  
  
  // Validar parâmetros
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(Math.max(1, limit), 999999); // Aumentar de 100 para 999999
  const offset = (validatedPage - 1) * validatedLimit;

  // Validar campo de ordenação para prevenir SQL injection
  const allowedSortFields = [
    'action_priority',
    'days_until_expiration',
    'combined_risk_score',
    'expiration_date',
    'item_name',
    'certificate_type',
    'renewal_urgency_level'
  ];
  
  const validatedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'action_priority';
  const validatedSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  // Query para contar total de registros
  const [countResult] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total
    FROM mat_view_prod.predictive_certificate_analysis
    WHERE company_id = ?`,
    [companyId]
  );

  const totalItems = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalItems / validatedLimit);

  // Query principal com paginação
  const [rows] = await pool.query<ReportRow[]>(
    `SELECT
      -- Identificação básica
      item_name,
      item_code,
      certificate_type,
      certificate_description,
      category_name,
      certificate_status_name,
      
      -- Localização
      Home_Area_city,
      Home_Area_State,
      Home_site_name,
      
      -- Status e validade
      validity_status,
      days_until_expiration,
      expiration_date,
      issue_date,
      
      -- Níveis de urgência e risco
      renewal_urgency_level,
      combined_risk_score,
      compliance_score,
      operational_impact_score,
      expiration_risk_score,
      
      -- Recomendações IA
      ai_recommendation,
      recommended_action,
      action_priority,
      needs_immediate_action,
      
      -- Probabilidades e scores
      recertification_probability,
      renewal_probability_score,
      automation_readiness_score,
      pattern_confidence_score,
      
      -- Financeiro e valor
      asset_value_at_risk,
      financial_risk_value,
      purchase_cost,
      purchase_currency,
      
      -- Emissor
      issuer_company_name,
      issuer_reliability_score,
      
      -- Automação
      automation_candidate,
      
      -- Tendências
      trend_direction,
      risk_trend,
      
      -- Detalhes do ativo
      brand,
      model,
      serial,
      
      -- Responsável
      custody_name,
      custody_email,
      department_name,
      cost_center_name,
      
      -- Flags importantes
      is_expiring_this_week,
      is_expiring_90_days,
      is_expired,
      is_high_value_asset,
      is_critical_compliance,
      in_optimal_renewal_window,
      
      -- Workload e recursos
      concurrent_renewals_same_period,
      department_workload_index,
      resource_availability_score,
      
      -- Data recomendada
      recommended_start_date,
      days_until_recommended_start
      
    FROM
      mat_view_prod.predictive_certificate_analysis
    WHERE
      company_id = ?
    ORDER BY ${validatedSortBy} ${validatedSortOrder}
    LIMIT ? OFFSET ?`,
    [companyId, validatedLimit, offset]
  );

  return {
    data: rows,
    pagination: {
      currentPage: validatedPage,
      totalPages,
      totalItems,
      itemsPerPage: validatedLimit,
      hasNextPage: validatedPage < totalPages,
      hasPreviousPage: validatedPage > 1
    }
  };
};