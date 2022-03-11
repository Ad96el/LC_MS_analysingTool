import axios from 'axios';
// own libs

import authProvider from 'authProvider';
import config from 'config';

const apiUrl = config.apiURL;

const createRequest = async () => {
  const token = await authProvider.getToken();
  const request = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return request;
};
const provider = {

  getValues: async (id : string, kind: string, intervall?: number[]) : Promise<any> => {
    const axs = await createRequest();
    try {
      const response = await axs.get<string[]>('sample/values', { params: { id, kind, intervall: JSON.stringify(intervall) } });

      if (response.status === 200) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(response.data);
    } catch (error) {
      return Promise.reject(error);
    }
  },

};

export default provider;
