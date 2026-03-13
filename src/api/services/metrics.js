import client from '../client';
import { endpoints } from '../endpoints';

const get = () => client.get(endpoints.metrics.get);

const metricsService = { get };
export default metricsService;
