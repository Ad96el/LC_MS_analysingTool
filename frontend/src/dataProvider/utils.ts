import axios from 'axios';
import config from 'config';

const apiUrl = config.apiURL;
const axs = axios.create({
  baseURL: apiUrl,
  headers: {
    'content-type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const provider = {

  getVersions: async (route: string, id: string) : Promise<any> => {
    try {
      const response = await axs.get(`${route}/version/${id}`);
      if (response.status === 200) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(response.data);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // necessary because in the community version there is no support for many 2 many relations
  getMethodByMethodSet: async (id: string) : Promise<any> => {
    try {
      const response = await axs.get(`/method/methodset/${id}`);
      if (response.status === 200) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(response.data);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getColors: async () : Promise<any> => {
    try {
      const response = await axs.get('/utils/color');
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
