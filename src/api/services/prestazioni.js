import client from '../client';
import { endpoints } from '../endpoints';

const list = (params) => client.get(endpoints.prestazioni.list, { params });
const get = (prestazioneId) => client.get(endpoints.prestazioni.detail(prestazioneId));
const bySpecialita = (specialitaId, params) => client.get(endpoints.prestazioni.bySpecialita(specialitaId), { params });

const prestazioniService = { list, get, bySpecialita };
export default prestazioniService;
