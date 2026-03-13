import client from '../client';
import { endpoints } from '../endpoints';

const list = (params) => client.get(endpoints.visite.list, { params });
const get = (visitaId) => client.get(endpoints.visite.detail(visitaId));
const getReferti = (visitaId, params) => client.get(endpoints.visite.referti.list(visitaId), { params });
const updateRelazione = (visitaId, payload) => client.patch(endpoints.visite.relazione(visitaId), payload);
const printRelazione = (visitaId, params = {}) => client.get(endpoints.visite.relazionePrint(visitaId), { params, responseType: 'blob' });
// Guest access: exchange token + codice fiscale for access to the visita/referto
// Use fetch here (without axios interceptors) so that a 401/403 from the guest endpoint
// can be handled locally by the caller instead of triggering the global auth redirect.
const guestAccess = async (payload) => {
	const url = endpoints.visite.guest();
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		// credentials: 'include' // not needed unless backend requires cookies
	});

	// Attempt to parse JSON, tolerate empty body
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
