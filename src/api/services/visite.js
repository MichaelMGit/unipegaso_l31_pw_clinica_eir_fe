import client from '../client';
import { endpoints } from '../endpoints';

const list = (params) => client.get(endpoints.visite.list, { params });
const get = (visitaId) => client.get(endpoints.visite.detail(visitaId));
const getReferti = (visitaId, params) => client.get(endpoints.visite.referti.list(visitaId), { params });
const updateRelazione = (visitaId, payload) => client.patch(endpoints.visite.relazione(visitaId), payload);
const printRelazione = (visitaId, params = {}) => client.get(endpoints.visite.relazionePrint(visitaId), { params, responseType: 'blob' });
const guestAccess = async (payload) => {
	const url = endpoints.visite.guest();
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	let data = null;
	try {
		data = await res.json();
	} catch (e) {
		data = null;
	}

	if (!res.ok) {
		const err = new Error(`Request failed with status ${res.status}`);
		err.response = { data, status: res.status };
		throw err;
	}

	return { data, status: res.status };
};

const visiteService = { list, get, getReferti, updateRelazione, printRelazione, guestAccess };
export default visiteService;
