import client from '../client';
import { endpoints } from '../endpoints';

const list = (params) => client.get(endpoints.specialita.list, { params });
const create = (payload) => client.post(endpoints.specialita.create, payload);
const update = (specialitaId, payload) => client.patch(endpoints.specialita.detail(specialitaId), payload);
const prestazioni = (specialitaId, params) => client.get(endpoints.specialita.prestazioni(specialitaId), { params });

const specialitaService = { list, create, update, prestazioni };
export default specialitaService;
