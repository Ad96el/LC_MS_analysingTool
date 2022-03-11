import axios from 'axios';
import { proteinTypes } from 'types';
// own libs

import config from 'config';
import authProvider from '../authProvider';

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

  getModification: async () : Promise<string[]> => {
    const axs = await createRequest();
    try {
      const response = await axs.get<string[]>('/protein/modification');

      if (response.status === 200) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(response.data);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  validateFile: async (file: File) : Promise<proteinTypes.ChainI[]> => {
    const axs = await createRequest();
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axs.post('/protein/validate', formData);
      if (response.status === 200) {
        const { data } = response;
        return Promise.resolve(data);
      }

      return Promise.reject();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  calculate: async (chains : proteinTypes.ChainI[], file : File) :
                    Promise<proteinTypes.Rows> => {
    const axs = await createRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('params', JSON.stringify(chains));
    try {
      const response = await axs.post('/protein/calculate', formData);

      if (response.status === 200) {
        const { data } = response;
        return Promise.resolve(data);
      }
      return Promise.reject();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  getStatistics: async () : Promise<any> => {
    const axs = await createRequest();
    try {
      const response = await axs.get('/utils/statistics');

      if (response.status === 200) {
        const { data } = response;
        return Promise.resolve(data);
      }
      return Promise.reject();
    } catch (error) {
      return Promise.reject(error);
    }
  },

};

export default provider;
