import client from '../client';
import { endpoints } from '../endpoints';

const get = () => client.get(endpoints.health.get);

const healthService = { get };
export default healthService;
