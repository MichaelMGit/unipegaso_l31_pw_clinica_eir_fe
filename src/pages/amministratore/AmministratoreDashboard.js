import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, IconButton, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { statisticsService } from '../../api/services';
import KpiCard from '../../components/KpiCard';
import PeopleIcon from '@mui/icons-material/People';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RefreshIcon from '@mui/icons-material/Refresh';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOptionsSmall = {
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { font: { size: 11 } } },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { ticks: { maxRotation: 0, minRotation: 0 } },
    y: { ticks: { beginAtZero: true } },
  },
};

const cardStyle = { padding: 16, minHeight: 110 };

const AmministratoreDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [trend, setTrend] = useState([]);
  const [trendDays, setTrendDays] = useState(30);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const [topSpecialita, setTopSpecialita] = useState([]);
  const [topLimit, setTopLimit] = useState(5);
  const [loadingTop, setLoadingTop] = useState(false);

  const [revenue, setRevenue] = useState([]);
  const [revenueFrom, setRevenueFrom] = useState('');
  const [revenueTo, setRevenueTo] = useState('');
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  useEffect(() => {
    fetchOverview();
    fetchTrend();
    fetchTopSpecialita();
    fetchRevenue();
  }, []);

  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await statisticsService.overview();
      setOverview(res.data || res);
    } catch (e) {
      console.error('overview error', e);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchTrend = async (days = trendDays) => {
    setLoadingTrend(true);
    try {
      const res = await statisticsService.prenotazioniTrend({ days });
      setTrend(res.data || res || []);
    } catch (e) {
      console.error('trend error', e);
    } finally {
      setLoadingTrend(false);
    }
  };

  const fetchTopSpecialita = async (limit = topLimit) => {
    setLoadingTop(true);
    try {
      const res = await statisticsService.topSpecialita({ limit });
      setTopSpecialita(res.data || res || []);
    } catch (e) {
      console.error('top specialita error', e);
    } finally {
      setLoadingTop(false);
    }
  };

  const fetchRevenue = async (params = { from_date: revenueFrom || undefined, to_date: revenueTo || undefined }) => {
    setLoadingRevenue(true);
    try {
      const res = await statisticsService.revenueBySpecialita(params);
      setRevenue(res.data || res || []);
    } catch (e) {
      console.error('revenue error', e);
    } finally {
      setLoadingRevenue(false);
    }
  };
  

  const buildTrendChart = () => {
    const labels = trend.map((it) => it.data || it.day || it.label || it.x);
    const data = trend.map((it) => it.count ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Prenotazioni',
          data,
          borderColor: 'rgb(75,192,192)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          tension: 0.2,
        },
      ],
    };
  };

  const buildTopSpecialitaChart = () => {
    const labels = topSpecialita.map((it) => it.specialita_nome);
    const data = topSpecialita.map((it) => it.count ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Prenotazioni',
          data,
          backgroundColor: 'rgba(53,162,235,0.6)',
        },
      ],
    };
  };

  const buildRevenueChart = () => {
    const labels = revenue.map((it) => it.specialita_nome);
    const data = revenue.map((it) => it.revenue ?? 0);
      return {
        labels,
        datasets: [
          {
            label: 'Ricavi',
            data,
            backgroundColor: 'rgba(255,99,132,0.6)',
          },
        ],
      };
  };

  

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Dashboard Amministratore</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {loadingOverview ? (
          <Grid item xs={12}>
            <Paper style={cardStyle}><CircularProgress /></Paper>
          </Grid>
        ) : overview ? (
          <>
            <Grid container item xs={12} spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={2}>
                <KpiCard title="Utenti totali" value={overview.total_users} icon={<PeopleIcon />} color="#1976d2" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Utenti guest" value={overview.total_guest_users} icon={<PersonOutlineIcon />} color="#ff9800" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Nuovi utenti (ultimo mese)" value={overview.new_users_last_month} icon={<PersonAddIcon />} color="#9c27b0" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Prenotazioni totali" value={overview.total_prenotazioni} icon={<EventAvailableIcon />} color="#0288d1" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Nuove pren. (30d)" value={overview.new_pren_last_30} icon={<AddCircleOutlineIcon />} color="#fb8c00" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Prenotazioni completate (30d)" value={overview.completed_pren_last_30} icon={<CheckCircleIcon />} color="#2e7d32" />
              </Grid>
            </Grid>

            <Grid container item xs={12} spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={2}>
                <KpiCard title="Prenotazioni confermate" value={overview.prenotazioni_by_stato.confermata} icon={<CheckCircleIcon />} color="#0288d1" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Referti" value={overview.total_referti} icon={<DescriptionIcon />} color="#8e24aa" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Visite" value={overview.total_visite} icon={<LocalHospitalIcon />} color="#d32f2f" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Medici" value={overview.total_medici} icon={<MedicalServicesIcon />} color="#6a1b9a" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Ricavi (30g)" value={overview.revenue_last_30_days} isCurrency decimals={2} icon={<EuroSymbolIcon />} color="#2e7d32" />
              </Grid>

              <Grid item xs={12} md={2}>
                <KpiCard title="Ricavi non incassati (30g)" value={overview.unpaid_revenue_last_30_days} isCurrency decimals={2} icon={<AccountBalanceWalletIcon />} color="#c62828" />
              </Grid>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Paper style={cardStyle}><Typography>Nessuna overview disponibile</Typography></Paper>
          </Grid>
        )}
      </Grid>


      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, mb: 1, gap: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChartIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Trend Prenotazioni ({trendDays} giorni)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                      label="Giorni"
                      type="number"
                      value={trendDays}
                      onChange={(e) => setTrendDays(Number(e.target.value))}
                      size="small"
                      sx={{ width: { xs: '100%', sm: 110 } }}
                      inputProps={{ min: 1 }}
                    />
                    <IconButton size="small" onClick={() => { fetchTrend(trendDays); }} aria-label="aggiorna-trend">
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
            {loadingTrend ? <CircularProgress /> : (
              <Box sx={{ height: 220 }}>
                <Line data={buildTrendChart()} options={chartOptionsSmall} />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, mb: 1, gap: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon color="secondary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Top Specialità (top {topLimit})</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                      <InputLabel id="top-limit-label">Top</InputLabel>
                      <Select
                        labelId="top-limit-label"
                        value={topLimit}
                        label="Top"
                        onChange={(e) => setTopLimit(Number(e.target.value))}
                        sx={{ width: { xs: '100%', sm: 96 } }}
                      >
                        {[5,10,15,20].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <IconButton size="small" onClick={() => fetchTopSpecialita(topLimit)} aria-label="aggiorna-top">
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
            {loadingTop ? <CircularProgress /> : (
              <Box sx={{ height: 220 }}>
                <Bar data={buildTopSpecialitaChart()} options={chartOptionsSmall} />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, mb: 1, gap: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MonetizationOnIcon sx={{ color: '#2e7d32' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Ricavi per specialità</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <TextField label="Da" type="date" size="small" InputLabelProps={{ shrink: true }} value={revenueFrom} onChange={(e) => setRevenueFrom(e.target.value)} sx={{ width: { xs: '100%', sm: 150 } }} />
                    <TextField label="A" type="date" size="small" InputLabelProps={{ shrink: true }} value={revenueTo} onChange={(e) => setRevenueTo(e.target.value)} sx={{ width: { xs: '100%', sm: 150 } }} />
                    <IconButton size="small" onClick={() => { fetchRevenue({ from_date: revenueFrom || undefined, to_date: revenueTo || undefined }); }} aria-label="aggiorna-revenue">
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
            {loadingRevenue ? <CircularProgress /> : (
              <Box sx={{ height: 220 }}>
                <Bar data={buildRevenueChart()} options={chartOptionsSmall} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AmministratoreDashboard;
