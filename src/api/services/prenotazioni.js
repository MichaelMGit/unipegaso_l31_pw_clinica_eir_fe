import client from '../client';
import { endpoints } from '../endpoints';

const list = (params) => client.get(endpoints.prenotazioni.list, { params });
const create = (payload) => client.post(endpoints.prenotazioni.create, payload);
const get = (id) => client.get(endpoints.prenotazioni.detail(id));
const updateStatus = (id, payload) => client.patch(endpoints.prenotazioni.status(id), payload);

const reschedule = (id, payload) => client.post(endpoints.prenotazioni.reschedule(id), payload);
const resendGuestToken = (id) => client.post(endpoints.prenotazioni.resendGuestToken(id));
const updateGuest = (id, payload) => client.patch(endpoints.prenotazioni.guest(id), payload);
// Set booking paid flag. Backend expects a PATCH with { pagato: true|false }
const markPaid = (id, pagato = true) => client.patch(endpoints.prenotazioni.pagato(id), { pagato: !!pagato });

const prenotazioniService = {
	list,
	create,
	get,
	updateStatus,
	reschedule,
	resendGuestToken,
	updateGuest,
	markPaid,
};

export default prenotazioniService;
