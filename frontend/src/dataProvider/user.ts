import axios from 'axios';
// own libs
import authProvider from 'authProvider';
import { credentialsI } from 'types';
import config from 'config';

const apiUrl = config.apiURL;

interface UserI {
    approved: boolean,
    email: string,
    created: string,
    role: number
}

interface restI {
  email: string
}

const createRequest = async () => {
  const token = await authProvider.getToken();
  const request = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return request;
};

const provider = {

  approvUser: async (id : string, data : UserI) : Promise<any> => {
    const axs = await createRequest();
    try {
      const response = await axs.put(`/user/${id}`, data);

      if (response.status === 200) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(response.data);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  signup: async (credentials : credentialsI) : Promise<any> => {
    const axs = await createRequest();
    try {
      const response = await axs.post('/user/signup', credentials);
      if (response.status === 200) {
        return Promise.resolve();
      }
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.reject();
  },
  resetPassword: async (data: restI) : Promise<any> => {
    const asx = await createRequest();
    try {
      const response = await asx.post('/user/restore', data);
      if (response.status === 200) {
        return Promise.resolve();
      }
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.reject();
  },

};

export default provider;
