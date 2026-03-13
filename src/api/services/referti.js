import client from '../client';
import { endpoints } from '../endpoints';

// Create a referto for a visita (API uses `visite/{visita_id}/referti`)
const create = (visitaId, payload) =>
  client.post(endpoints.visite.referti.create(visitaId), payload);

const get = (refertoId) => client.get(endpoints.referti.detail(refertoId));

const uploadAttachment = (refertoId, formData, config = {}) =>
  client.post(endpoints.referti.attachments(refertoId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });

const download = (refertoId, params = {}) =>
  client.get(endpoints.referti.download(refertoId), { params, responseType: 'blob' });

const refertiService = { create, get, uploadAttachment, download };
export default refertiService;
