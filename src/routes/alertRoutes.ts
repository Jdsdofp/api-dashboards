// src/routes/alertRoutes.ts
import { Router } from 'express';
import * as alertController from '../controllers/alertController';

const router = Router();

// =====================================
// 🚨 ROTAS DE ALERTAS
// =====================================

/**
 * @route   GET /api/alerts/:companyId/summary
 * @desc    Obter resumo geral de todos os alertas
 * @access  Private
 */
router.get('/:companyId/summary', alertController.getAlertSummary);

/**
 * @route   GET /api/alerts/:companyId/alarm2/active
 * @desc    Listar pessoas com Alarm2 ativo
 * @access  Private
 */
router.get('/:companyId/alarm2/active', alertController.getPeopleWithAlarm2);

/**
 * @route   GET /api/alerts/:companyId/button2/pressed
 * @desc    Listar pessoas com Button2 pressionado
 * @access  Private
 */
router.get('/:companyId/button2/pressed', alertController.getPeopleWithButton2);

/**
 * @route   GET /api/alerts/:companyId/buttons/comparison
 * @desc    Comparativo de botões (para gráficos)
 * @access  Private
 */
router.get('/:companyId/buttons/comparison', alertController.getButtonComparison);

/**
 * @route   GET /api/alerts/:companyId/alarms/comparison
 * @desc    Comparativo de alarmes (para gráficos)
 * @access  Private
 */
router.get('/:companyId/alarms/comparison', alertController.getAlarmComparison);

/**
 * @route   GET /api/alerts/:companyId/active/all
 * @desc    Todos os alertas ativos
 * @access  Private
 */
router.get('/:companyId/active/all', alertController.getAllActiveAlerts);

/**
 * @route   GET /api/alerts/:companyId/history/24h
 * @desc    Histórico de mudanças nas últimas 24h
 * @access  Private
 */
router.get('/:companyId/history/24h', alertController.getAlertHistory24h);

/**
 * @route   GET /api/alerts/:companyId/history/custom
 * @desc    Histórico de mudanças com período customizado
 * @query   hours - número de horas (padrão: 24)
 * @access  Private
 */
router.get('/:companyId/history/custom', alertController.getAlertHistoryCustom);

/**
 * @route   GET /api/alerts/:companyId/by-department
 * @desc    Distribuição de alertas por departamento
 * @access  Private
 */
router.get('/:companyId/by-department', alertController.getAlertsByDepartment);

/**
 * @route   GET /api/alerts/:companyId/by-zone
 * @desc    Alertas por zona (heatmap)
 * @access  Private
 */
router.get('/:companyId/by-zone', alertController.getAlertsByZone);

/**
 * @route   GET /api/alerts/:companyId/multiple
 * @desc    Pessoas com múltiplos alertas simultâneos
 * @access  Private
 */
router.get('/:companyId/multiple', alertController.getPeopleWithMultipleAlerts);

/**
 * @route   GET /api/alerts/:companyId/filter
 * @desc    Buscar pessoas com filtros específicos
 * @query   alarm1, alarm2, button1, button2, mandown, department, zone, priority
 * @access  Private
 */
router.get('/:companyId/filter', alertController.getPeopleWithFilteredAlerts);

/**
 * @route   GET /api/alerts/:companyId/export
 * @desc    Exportar dados de alertas (JSON ou CSV)
 * @query   format - json ou csv (padrão: json)
 * @query   alarm1, alarm2, button1, button2, mandown, department, zone, priority (filtros opcionais)
 * @access  Private
 */
router.get('/:companyId/export', alertController.exportAlerts);

export default router;