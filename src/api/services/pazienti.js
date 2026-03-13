import client from '../client';
import { endpoints } from '../endpoints';

const list = (params) => client.get(endpoints.pazienti.list, { params });
const get = (pazienteId) => client.get(endpoints.pazienti.detail(pazienteId));
const update = (pazienteId, data) => client.patch(endpoints.pazienti.update(pazienteId), data);
const getPrenotazioni = (params) => client.get(endpoints.prenotazioni.list, { params });

const getReferti = (pazienteId, params) =>
	client.get(endpoints.pazienti.referti(pazienteId), { params });

const pazientiService = { list, get, update, getPrenotazioni, getReferti };
export default pazientiService;
