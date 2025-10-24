// src/controllers/alertController.ts
import { Request, Response } from 'express';
import * as alertService from '../services/alertManagementService';

// =====================================
// 🚨 ALERT CONTROLLERS
// =====================================

/**
 * GET /api/alerts/summary
 * Obter resumo geral de todos os alertas
 */
export const getAlertSummary = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const summary = await alertService.getAlertSummary(companyId);

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Error in getAlertSummary controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar resumo de alertas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/alarm2/active
 * Listar pessoas com Alarm2 ativo
 */
export const getPeopleWithAlarm2 = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const people = await alertService.getPeopleWithAlarm2Active(companyId);

    return res.status(200).json({
      success: true,
      data: people,
      total: people.length
    });
  } catch (error) {
    console.error('❌ Error in getPeopleWithAlarm2 controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar pessoas com Alarm2',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/button2/pressed
 * Listar pessoas com Button2 pressionado
 */
export const getPeopleWithButton2 = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const people = await alertService.getPeopleWithButton2Pressed(companyId);

    return res.status(200).json({
      success: true,
      data: people,
      total: people.length
    });
  } catch (error) {
    console.error('❌ Error in getPeopleWithButton2 controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar pessoas com Button2',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/buttons/comparison
 * Comparativo de botões (para gráfico)
 */
export const getButtonComparison = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const comparison = await alertService.getButtonComparison(companyId);

    return res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('❌ Error in getButtonComparison controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar comparativo de botões',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/alarms/comparison
 * Comparativo de alarmes (para gráfico)
 */
export const getAlarmComparison = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const comparison = await alertService.getAlarmComparison(companyId);

    return res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('❌ Error in getAlarmComparison controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar comparativo de alarmes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/active/all
 * Todos os alertas ativos
 */
export const getAllActiveAlerts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const alerts = await alertService.getAllActiveAlerts(companyId);

    return res.status(200).json({
      success: true,
      data: alerts,
      total: alerts.length
    });
  } catch (error) {
    console.error('❌ Error in getAllActiveAlerts controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar alertas ativos',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/history/24h
 * Histórico de mudanças nas últimas 24h
 */
export const getAlertHistory24h = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const history = await alertService.getAlertHistory24h(companyId);

    return res.status(200).json({
      success: true,
      data: history,
      total: history.length
    });
  } catch (error) {
    console.error('❌ Error in getAlertHistory24h controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico de alertas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/history/custom?hours=48
 * Histórico de mudanças com período customizado
 */
export const getAlertHistoryCustom = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const hours = parseInt(req.query.hours as string) || 24;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const history = await alertService.getAlertHistoryCustomPeriod(companyId, hours);

    return res.status(200).json({
      success: true,
      data: history,
      total: history.length,
      period_hours: hours
    });
  } catch (error) {
    console.error('❌ Error in getAlertHistoryCustom controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico customizado',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/by-department
 * Distribuição de alertas por departamento
 */
export const getAlertsByDepartment = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const distribution = await alertService.getAlertsByDepartment(companyId);

    return res.status(200).json({
      success: true,
      data: distribution,
      total_departments: distribution.length
    });
  } catch (error) {
    console.error('❌ Error in getAlertsByDepartment controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar alertas por departamento',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/by-zone
 * Alertas por zona (heatmap)
 */
export const getAlertsByZone = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const distribution = await alertService.getAlertsByZone(companyId);

    return res.status(200).json({
      success: true,
      data: distribution,
      total_zones: distribution.length
    });
  } catch (error) {
    console.error('❌ Error in getAlertsByZone controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar alertas por zona',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/multiple
 * Pessoas com múltiplos alertas simultâneos
 */
export const getPeopleWithMultipleAlerts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const people = await alertService.getPeopleWithMultipleAlerts(companyId);

    return res.status(200).json({
      success: true,
      data: people,
      total: people.length
    });
  } catch (error) {
    console.error('❌ Error in getPeopleWithMultipleAlerts controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar pessoas com múltiplos alertas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/filter
 * Buscar pessoas com filtros específicos
 * Query params: alarm1, alarm2, button1, button2, mandown, department, zone, priority
 */
export const getPeopleWithFilteredAlerts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { alarm1, alarm2, button1, button2, mandown, department, zone, priority } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    const filters: any = {};
    if (alarm1 === 'true') filters.alarm1 = true;
    if (alarm2 === 'true') filters.alarm2 = true;
    if (button1 === 'true') filters.button1 = true;
    if (button2 === 'true') filters.button2 = true;
    if (mandown === 'true') filters.mandown = true;
    if (department) filters.department = department;
    if (zone) filters.zone = zone;
    if (priority) filters.priority = priority;

    const people = await alertService.getPeopleWithAlerts(companyId, filters);

    return res.status(200).json({
      success: true,
      data: people,
      total: people.length,
      filters: filters
    });
  } catch (error) {
    console.error('❌ Error in getPeopleWithFilteredAlerts controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar alertas filtrados',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/alerts/export?format=csv
 * Exportar dados de alertas
 */
export const exportAlerts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { format = 'json', alarm1, alarm2, button1, button2, mandown, department, zone, priority } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID é obrigatório'
      });
    }

    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({
        success: false,
        message: 'Formato inválido. Use json ou csv'
      });
    }

    const filters: any = {};
    if (alarm1 === 'true') filters.alarm1 = true;
    if (alarm2 === 'true') filters.alarm2 = true;
    if (button1 === 'true') filters.button1 = true;
    if (button2 === 'true') filters.button2 = true;
    if (mandown === 'true') filters.mandown = true;
    if (department) filters.department = department;
    if (zone) filters.zone = zone;
    if (priority) filters.priority = priority;

    const data = await alertService.exportAlertsData(companyId, format as 'json' | 'csv', filters);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=alerts_${companyId}_${Date.now()}.csv`);
      return res.send(data);
    }

    return res.status(200).json({
      success: true,
      data: data,
      total: data.length
    });
  } catch (error) {
    console.error('❌ Error in exportAlerts controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao exportar alertas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};