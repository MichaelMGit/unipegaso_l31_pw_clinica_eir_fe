import axios from 'axios';
import client from '../client';
import { endpoints } from '../endpoints';

const login = (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  return client.post(endpoints.auth.login, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

const refresh = (refreshToken) => {
  return axios.post(endpoints.auth.refresh, { refresh_token: refreshToken });
};

const me = () => client.get(endpoints.auth.me);

const logout = (refreshToken) => client.post(endpoints.auth.logout, { refresh_token: refreshToken });

const register = (payload) => client.post(endpoints.auth.register, payload);

const update = (payload) => client.patch(endpoints.auth.me, payload);

const authService = {
  login,
  refresh,
  me,
  update,
  logout,
  register,
};

export default authService;
