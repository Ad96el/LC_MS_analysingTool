import axios from 'axios';
import { credentialsI, loginI } from 'types';
import jwtDecode, { JwtPayload } from 'jwt-decode';

import config from 'config';

interface stateI {
  status: number
}

interface JWTSubPayload {
  email: string,
  role: string,
  id: string
}

const apiUrl = config.apiURLAuth;

const axs = axios.create({
  baseURL: apiUrl,
  headers: {
    'content-type': 'application/json',
  },
});
const header = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

export default {
  login: async (credentials : credentialsI) : Promise<void> => {
    const route : string = credentials.signUp ? '/signup' : '/login';
    if (!credentials.email && !credentials.password) {
      localStorage.setItem('token', 'guest');
      localStorage.setItem('permissions', '0');
      localStorage.setItem('username', 'none');
      return Promise.resolve();
    }
    try {
      const response = await axs.post(route, credentials, header);
      if (response.status === 200) {
        const { data } : {data: loginI} = response;
        const decoded = jwtDecode<JwtPayload>(data.token);
        const payload = (decoded.sub as any) as JWTSubPayload;
        localStorage.setItem('token', data.token);
        localStorage.setItem('permissions', payload.role);
        localStorage.setItem('username', payload.id);
        return Promise.resolve();
      }
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.reject();
  },

  logout: () : Promise<void> => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    return Promise.resolve();
  },

  checkError: ({ status } : stateI) : Promise<void> => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('username');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () : Promise<void> => (localStorage.getItem('username')
    ? Promise.resolve()
    : Promise.reject()),

  getPermissions: () : Promise<number> => {
    const role = localStorage.getItem('permissions');
    return role ? Promise.resolve(parseInt(role, 10)) : Promise.reject();
  },
  getToken: async () : Promise<string> => {
    const token = localStorage.getItem('token');
    return Promise.resolve(token as string);
  },
};
