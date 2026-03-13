export const endpoints = {
  auth: {
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    register: '/api/auth/registrazione',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
  },
  specialita: {
    list: '/api/specialita',
    create: '/api/specialita',
    detail: (specialitaId) => `/api/specialita/${specialitaId}`,
    prestazioni: (specialitaId) => `/api/specialita/${specialitaId}/prestazioni`,
  },
  medici: {
    list: '/api/medici',
    create: '/api/medici',
    detail: (medicoId) => `/api/medici/${medicoId}`,
    update: (medicoId) => `/api/medici/${medicoId}`,
    remove: (medicoId) => `/api/medici/${medicoId}`,
    slot: (medicoId) => `/api/medici/${medicoId}/slot`,
  },
  pazienti: {
    list: '/api/pazienti',
    detail: (pazienteId) => `/api/pazienti/${pazienteId}`,
    update: (pazienteId) => `/api/pazienti/${pazienteId}`,
    referti: (pazienteId) => `/api/pazienti/${pazienteId}/referti`,
  },
  prenotazioni: {
    list: '/api/prenotazioni',
    create: '/api/prenotazioni',
    detail: (id) => `/api/prenotazioni/${id}`,
    status: (id) => `/api/prenotazioni/${id}/status`,
    reschedule: (id) => `/api/prenotazioni/${id}/reschedule`,
    resendGuestToken: (id) => `/api/prenotazioni/${id}/resend-guest-token`,
    guest: (id) => `/api/prenotazioni/${id}/guest`,
    pagato: (id) => `/api/prenotazioni/${id}/pagamento`,
  },
  visite: {
    list: '/api/visite',
    detail: (visitaId) => `/api/visite/${visitaId}`,
    referti: {
      create: (visitaId) => `/api/visite/${visitaId}/referti`,
      list: (visitaId) => `/api/visite/${visitaId}/referti`,
    },
    relazione: (visitaId) => `/api/visite/${visitaId}/relazione`,
    relazionePrint: (visitaId) => `/api/visite/${visitaId}/relazione/print`,
    guest: () => `/api/visite/guest`,
  },
  prestazioni: {
    list: '/api/prestazioni',
    detail: (prestazioneId) => `/api/prestazioni/${prestazioneId}`,
    bySpecialita: (specialitaId) => `/api/specialita/${specialitaId}/prestazioni`,
  },
  health: {
    get: '/api/health',
  },
  metrics: {
    get: '/api/metrics',
  },
  statistiche: {
    overview: '/api/statistiche/overview',
    prenotazioniTrend: '/api/statistiche/prenotazioni/trend',
    prestazioniRevenue: '/api/statistiche/prestazioni/revenue',
    topSpecialita: '/api/statistiche/top-specialita',
    mediciAvgPrenPerMedico: '/api/statistiche/medici/avg-pren-per-medico',
    revenueBySpecialita: '/api/statistiche/revenue/by-specialita',
    kpi: {
      noShowRate: '/api/statistiche/kpi/no-show-rate',
      avgTimeToReferto: '/api/statistiche/kpi/avg-time-to-referto',
    },
    cache: {
      clear: '/api/statistiche/cache/clear',
    },
  },
  referti: {
    detail: (refertoId) => `/api/referti/${refertoId}`,
    attachments: (refertoId) => `/api/referti/${refertoId}/attachments`,
    download: (refertoId) => `/api/referti/${refertoId}/download`,
  },
};
