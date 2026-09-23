import axios from 'axios';
import { API_BASE_URL } from './config';

import i18n from '../i18n';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Accept-Language': i18n.language,
  },
});

i18n.on('languageChanged', (lng: string) => {
  axiosClient.defaults.headers['Accept-Language'] = lng;
});