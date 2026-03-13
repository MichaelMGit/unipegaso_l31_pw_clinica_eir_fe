import client from '../client';
import { endpoints } from '../endpoints';

const list = (params) => client.get(endpoints.medici.list, { params });
const get = (medicoId) => client.get(endpoints.medici.detail(medicoId));
const getSlots = (medicoId, data) => client.get(endpoints.medici.slot(medicoId), { params: { data } });

const create = (payload) => client.post(endpoints.medici.create, payload);
const update = (medicoId, payload) => client.patch(endpoints.medici.update(medicoId), payload);
const remove = (medicoId) => client.delete(endpoints.medici.remove(medicoId));

const mediciService = { list, get, getSlots, create, update, remove };
export default mediciService;
