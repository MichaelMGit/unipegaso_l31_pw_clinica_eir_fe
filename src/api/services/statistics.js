import client from '../client';
import { endpoints } from '../endpoints';

const overview = () => client.get(endpoints.statistiche.overview);

// ritorna trend delle prenotazioni; accetta { days }
const prenotazioniTrend = (params = {}) => client.get(endpoints.statistiche.prenotazioniTrend, { params });

// revenue per prestazioni (opzionali from_date/to_date)
const prestazioniRevenue = (params = {}) => client.get(endpoints.statistiche.prestazioniRevenue, { params });

// top specialita (opzionale { limit })
const topSpecialita = (params = {}) => client.get(endpoints.statistiche.topSpecialita, { params });

const mediciAvgPrenPerMedico = () => client.get(endpoints.statistiche.mediciAvgPrenPerMedico);

const revenueBySpecialita = (params = {}) => client.get(endpoints.statistiche.revenueBySpecialita, { params });

// KPI endpoints
const noShowRate = (params = {}) => client.get(endpoints.statistiche.kpi.noShowRate, { params });
const avgTimeToReferto = (params = {}) => client.get(endpoints.statistiche.kpi.avgTimeToReferto, { params });

// amministrativo: svuota cache statistiche
const clearCache = () => client.post(endpoints.statistiche.cache.clear);

const statisticsService = {
  overview,
  prenotazioniTrend,
  prestazioniRevenue,
  topSpecialita,
  mediciAvgPrenPerMedico,
  revenueBySpecialita,
  noShowRate,
  avgTimeToReferto,
  clearCache,
};

export default statisticsService;
