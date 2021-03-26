import axios from 'axios';
import cookie from 'js-cookie';
import Qs from 'qs';
import { message } from 'antd';
import { TOKEN, REFRESH_TOKEN, CONFIG_SERVER } from '../constants/config';
import {
  actionRefreshToken,
  actionLogout
} from '../../view/system/systemAction';

const request = axios.create();

let isAlreadyFetchingAccessToken = false;
let subscribers = [];
const tokenUrl = '/token';

function onAccessTokenFetched(access_token) {
  subscribers = subscribers.map((callback) => callback(access_token));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

request.interceptors.request.use(
  (config) => {
    // if (config.url.indexOf(tokenUrl) !== -1) {
    //   delete config.headers.Authorization;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error.response || { data: {} });
  }
);

request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('VANHT-debug-401', error);
    const originalRequest = error.config;
    if (
      (error.response && error.response.status === 401) ||
      !cookie.get(TOKEN)
    ) {
      const refreshToken = cookie.get(REFRESH_TOKEN);
      if (
        refreshToken &&
        !originalRequest._retry &&
        error.config.url.indexOf(tokenUrl) === -1
      ) {
        originalRequest._retry = true;
        if (!isAlreadyFetchingAccessToken) {
          isAlreadyFetchingAccessToken = true;
          actionRefreshToken(refreshToken)
            .then((res) => {
              isAlreadyFetchingAccessToken = false;
              cookie.set(TOKEN, res.data.access_token, {
                expires: new Date(
                  (res.data.expires_in || 1800) * 1000 + Date.now()
                ),
              });
              cookie.set(REFRESH_TOKEN, res.data.refresh_token, {
                expires: new Date(
                  (res.data.refresh_expires_in || 1800) * 1000 + Date.now()
                ),
              });
              onAccessTokenFetched(res.data.access_token);
            })
            .catch(() => {
              subscribers = [];
              cookie.remove(TOKEN);
              cookie.remove(REFRESH_TOKEN);
              actionLogout();
            });
        }
        const retryOriginalRequest = new Promise((resolve) => {
          addSubscriber((access_token) => {
            originalRequest.headers.Authorization = 'Bearer ' + access_token;
            resolve(axios(originalRequest));
          });
        });
        return retryOriginalRequest;
      } else {
        if (error.config.url.indexOf(tokenUrl) !== -1) {
          if (error.response.status === 403) {
            message.error('Your account is not allowed to access the system!');
            setTimeout(() => {
              actionLogout();
            }, 1000);
          } else if (error.response.status === 400) {
            message.error('Sysstem error!');
          }
        } else {
          actionLogout();
        }
        subscribers = [];
        cookie.remove(TOKEN);
        cookie.remove(REFRESH_TOKEN);
      }
    } else {
      return Promise.reject(error?.response || { data: {} });
    }
  }
);

const api = (options) => {
  let config = {
    baseURL: CONFIG_SERVER.BASE_URL,
    ...options,
    paramsSerializer: (params) =>
      Qs.stringify(params, { arrayFormat: 'repeat' }),
    headers: {
      ...options.headers,
    },
  };
  if (cookie.get(TOKEN)) {
    config.headers.Authorization = `Bearer ${cookie.get(TOKEN)}`;
  }
  return request(config);
};

export default api;
