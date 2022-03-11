import axios from 'axios';
// own libs
import config from 'config';

const apiUrl = config.api2URL;

const createRequest = async () => {
  const request = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return request;
};

const provider = {
  getAmbrData: async (csvFile: File, excelFile :File) : Promise<any> => {
    const axs = await createRequest();
    const formData = new FormData();
    formData.append('file1', csvFile);
    formData.append('file2', excelFile);
    try {
      const response = await axs.post('/ambrfile', formData);
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
