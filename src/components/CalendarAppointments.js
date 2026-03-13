import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import itLocale from '@fullcalendar/core/locales/it';
import { Box, Card, CardContent, CircularProgress, FormControl, InputLabel, Select, MenuItem, Typography, Button, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { pazientiService } from '../api/services';
import PrenotazioneStatus from '../constants/prenotazioneStatus';
import { prenotazioniService } from '../api/services';
import { useNavigate } from 'react-router-dom';
import '../styles/fullcalendar.css';

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export default function CalendarAppointments({ medicoId, title, sx, showDoctorFilter = false, doctorsList = [], doctorsLoading = false, selectedDoctorId, onSelectedDoctorChange, showPatientFilter = false, selectedPatientId, onSelectedPatientChange, onCreate, eventClickable = true }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatientLabel, setSelectedPatientLabel] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);
  const lastFetchedMonthRef = useRef(null);
  const inFlightFetches = useRef(new Set());
  const navigate = useNavigate();

  const fetchForMonth = async (visibleDate) => {
    if (!visibleDate) return;
    const monthKey = `${medicoId || 'all'}-${visibleDate.getFullYear()}-${visibleDate.getMonth()}`;
    if (lastFetchedMonthRef.current === monthKey) return;
    if (inFlightFetches.current.has(monthKey)) return;
    inFlightFetches.current.add(monthKey);
    setLoading(true);
    try {
      const monthStart = startOfMonth(visibleDate);
      const monthEnd = endOfMonth(visibleDate);
      const data_da = monthStart.toISOString().slice(0, 10);
      const data_a = monthEnd.toISOString().slice(0, 10);
      const params = { data_da, data_a, page: 1, page_size: 200 };
      if (medicoId) params.medico_id = medicoId;
      if (selectedPatientId) params.paziente_id = selectedPatientId;
      const res = await prenotazioniService.list(params);
      const data = res.data.items;
      const ev = (Array.isArray(data) ? data : []).map((a) => {
        const titleTime = (a.orario_inizio || '').substring(0, 5);
        const patient = a.paziente ? `${a.paziente.nome || ''} ${a.paziente.cognome || ''}`.trim() : '';
        return {
          id: String(a.visita_id),
          title: `${titleTime} ${patient}`.trim(),
          start: a.data_visita ? `${a.data_visita}T${(a.orario_inizio || '').slice(0, 8)}` : a.data_visita,
          allDay: false,
          extendedProps: { raw: a },
          classNames: (a.stato === PrenotazioneStatus.COMPLETATA) ? ['fc-event-completed'] : [],
        };
      });
      setEvents(ev);
      lastFetchedMonthRef.current = monthKey;
    } catch (err) {
      console.error('Errore caricamento prenotazioni per calendario', err);
      setEvents([]);
    } finally {
      inFlightFetches.current.delete(monthKey);
      setLoading(false);
    }
  };

  const doSearchPatients = async (qParam) => {
    const q = (qParam || '').trim();
    if (!q || q.length < 3) {
      setPatientResults([]);
      return;
    }
    try {
      setPatientLoading(true);
      const res = await pazientiService.list({ q, page: 1, page_size: 10 });
      const items = res.data.items || [];
      setPatientResults(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Errore ricerca pazienti', err);
      setPatientResults([]);
    } finally {
      setPatientLoading(false);
    }
  };

  useEffect(() => {
    const q = (patientQuery || '').trim();
    if (selectedPatientLabel) return;
    if (q.length < 3) {
      setPatientResults([]);
      return;
    }
    const t = setTimeout(() => doSearchPatients(q), 350);
    return () => clearTimeout(t);
  }, [patientQuery, selectedPatientLabel]);

  useEffect(() => {
    lastFetchedMonthRef.current = null;
    const cal = calendarRef.current;
    const viewDate = cal ? cal.getApi().getDate() : new Date();
    fetchForMonth(viewDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicoId]);

  useEffect(() => {
    lastFetchedMonthRef.current = null;
    const cal = calendarRef.current;
    const viewDate = cal ? cal.getApi().getDate() : new Date();
    fetchForMonth(viewDate);
    if (!selectedPatientId) {
      setSelectedPatient(null);
      setSelectedPatientLabel('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatientId]);

  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  const handleMonthChange = (ev) => {
    const m = Number(ev.target.value);
    setSelectedMonth(m);
    const cal = calendarRef.current;
    if (cal) {
      const api = cal.getApi();
      lastFetchedMonthRef.current = null;
      api.gotoDate(new Date(selectedYear, m, 1));
    }
  };

  const handleYearChange = (ev) => {
    const y = Number(ev.target.value);
    setSelectedYear(y);
    const cal = calendarRef.current;
    if (cal) {
      const api = cal.getApi();
      lastFetchedMonthRef.current = null;
      api.gotoDate(new Date(y, selectedMonth, 1));
    }
  };



  const cardSx = sx ? { ...sx } : { height: 'calc(100vh - 140px)' };

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {showDoctorFilter && (
            <>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="doctor-filter-inline">Filtra Dottore</InputLabel>
                <Select
                  labelId="doctor-filter-inline"
                  label="Filtra Dottore"
                  value={selectedDoctorId || ''}
                  onChange={(e) => onSelectedDoctorChange && onSelectedDoctorChange(e.target.value)}
                >
                  <MenuItem value="">Tutti</MenuItem>
                  {doctorsList.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.cognome ? `${d.cognome} ${d.nome}` : d.nome || '-'}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {doctorsLoading && <CircularProgress size={20} />}
            </>
          )}

          {showPatientFilter && (
            <Autocomplete
              size="small"
              sx={{ minWidth: 220 }}
              options={patientResults}
              getOptionLabel={(o) => o ? `${o.cognome || ''} ${o.nome || ''}`.trim() : ''}
              filterOptions={(x) => x}
              value={selectedPatient}
              inputValue={selectedPatientLabel || patientQuery}
              onInputChange={(e, v, reason) => {
                if (reason === 'input') {
                  setPatientQuery(v);
                  setSelectedPatient(null);
                  setSelectedPatientLabel('');
                }
                if (reason === 'clear') {
                  setPatientQuery('');
                  setSelectedPatient(null);
                  setSelectedPatientLabel('');
                  onSelectedPatientChange && onSelectedPatientChange('');
                }
              }}
              onChange={(e, v) => {
                setSelectedPatient(v);
                if (v) {
                  const label = `${v.cognome ? `${v.cognome} ${v.nome}` : v.nome}`.trim();
                  setSelectedPatientLabel(label);
                  setPatientResults([]);
                  setPatientQuery('');
                  onSelectedPatientChange && onSelectedPatientChange(v.id);
                } else {
                  setSelectedPatientLabel('');
                  onSelectedPatientChange && onSelectedPatientChange('');
                }
              }}
              loading={patientLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Filtra Paziente"
                  InputProps={{
                    ...params.InputProps,
                  }}
                />
              )}
            />
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="month-select-label">Mese</InputLabel>
              <Select labelId="month-select-label" value={selectedMonth} label="Mese" onChange={handleMonthChange}>
                {monthNames.map((m, idx) => (
                  <MenuItem key={m} value={idx}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="year-select-label">Anno</InputLabel>
              <Select labelId="year-select-label" value={selectedYear} label="Anno" onChange={handleYearChange}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1 }} />
          {onCreate && (
            <Button variant="contained" color="primary" onClick={onCreate}>
              Nuova Prenotazione
            </Button>
          )}
        </Box>
        {loading && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5 }}>
            <CircularProgress />
          </Box>
        )}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            locales={[itLocale]}
            locale="it"
            initialView="dayGridMonth"
            events={events}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            height="100%"
            datesSet={(arg) => {
              const cal = calendarRef.current;
              const visible = cal ? cal.getApi().getDate() : new Date(arg.start);
              setSelectedMonth(visible.getMonth());
              setSelectedYear(visible.getFullYear());
              fetchForMonth(visible);
            }}
            eventContent={(info) => {
              const raw = info.event.extendedProps.raw || {};
              const time = (raw.orario_inizio || '').substring(0, 5) || info.timeText || '';
              const patient = raw.paziente ? `${raw.paziente.nome || ''} ${raw.paziente.cognome || ''}`.trim() : '';
              return (
                <div>
                  {time && <span className="fc-event-time">{time}</span>}
                  {patient && <span className="fc-event-title"> {patient}</span>}
                </div>
              );
            }}
            eventClick={(info) => {
              if (!eventClickable) return;
              const raw = info.event.extendedProps.raw;
              const visitaId = raw?.id;
              if (visitaId) {
                navigate(`/medico/visita/${visitaId}`);
              }
            }}
            eventDisplay="block"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
