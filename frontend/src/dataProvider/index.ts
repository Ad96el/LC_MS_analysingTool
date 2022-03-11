/* eslint-disable no-param-reassign */
import simpleRestProvider from 'ra-data-simple-rest';
import {
  CreateParams, fetchUtils, UpdateParams,
} from 'react-admin';
import axios from 'axios';
// own libs
import config from 'config';
import * as Types from 'types';
import proteinCalls from './proteinCalcualtor';
import utilCalls from './utils';
import SampleCalls from './sampleInformation';
import UserCalls from './user';
import api2 from './apiv2';
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

const httpClient = async (url : string, options : Types.LooseObject = {}) => {
  const token = await authProvider.getToken();
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  options.user = {
    authenticated: true,
    token: `Bearer ${token}`,
  };
  return fetchUtils.fetchJson(url, options);
};

const dataProvider = simpleRestProvider(apiUrl, httpClient);

const provider = {
  ...api2,
  ...SampleCalls,
  ...dataProvider,
  ...proteinCalls,
  ...utilCalls,
  ...UserCalls,
  create: async (resource : string, params : CreateParams) : Promise<any> => {
    if (resource !== 'sample' || !params.data.files) {
      return dataProvider.create(resource, params);
    }
    const { sid } = params.data;
    const { files } = params.data;

    const formData = new FormData();
    files.forEach((obj) => {
      formData.append('files', obj);
    });
    formData.append('sid', sid);
    const axs = await createRequest();
    try {
      const response = await axs.post('/sample', formData);
      if (response.status === 200) {
        return Promise.resolve({ data: { id: 1 } });
      }

      return Promise.reject();
    } catch (err) {
      return Promise.reject(err);
    }
  },

  update: async (resource: string, params: UpdateParams) : Promise <any> => {
    if (resource === 'methodset') {
      const { methods } = params.data;
      const updateMethods = methods.filter((obj) => typeof obj === 'string');
      params.data.methods = updateMethods;
      params.previousData.methods = [];
    }
    return dataProvider.update(resource, params);
  },

};

export default provider;
