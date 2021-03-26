import cookie from 'js-cookie';
import api from '../../utils/service/api';
import * as actionType from '../../utils/constants/actions';
import {
  CONFIG_SERVER,
  routes,
  REFRESH_TOKEN,
  TOKEN,
  BASE_ROUTER_PREFIX,
  VINLAB_LOCALE,
  USER_ROLES,
  FIRST_REFRESH_TOKEN,
  ROLES,
  VINLAB_VIEW_MODE,
} from '../../utils/constants/config';

const {
  CLIENT_ID,
  LOGIN_CALLBACK_URI,
  OIDC_LOGOUT_URI,
  OIDC_USERINFO_ENDPOINT,
  OIDC_ACCESS_TOKEN_URI,
  RESPONSE_TYPE,
  STATE,
  OIDC_AUTHORIZATION_URI,
  BASE_URL,
  SCOPE,
  AUDIENCE,
  TOKEN_PERMISSION,
} = CONFIG_SERVER;

const ENDPOINT_KEYCLOAK = '/auth/realms/vinlab/protocol/openid-connect';

export const actionChangeLanguage = (lang) => {
  cookie.set(VINLAB_LOCALE, lang);
  return {
    type: actionType.CHANGE_LANGUAGE,
    payload: lang,
  };
};
export const actionShowLoading = () => ({ type: actionType.SHOW_LOADING });

export const actionHideLoading = () => ({ type: actionType.HIDE_LOADING });

export const getAccountInfo = () => async (dispatch) => {
  try {
    dispatch(actionShowLoading());
    const { data } = await api({
      method: 'get',
      url:
        OIDC_USERINFO_ENDPOINT || `${BASE_URL + ENDPOINT_KEYCLOAK}/userinfo`,
    });

    dispatch({ type: actionType.FETCHING_PROFILE, payload: data });

    let isValidPage = false;
    const pathname = window.location.pathname || '';
    Object.keys(routes).forEach((key) => {
      if (!isValidPage && pathname.indexOf(routes[key]) > -1) {
        isValidPage = true;
      }
    });

    if (!isValidPage) {
      window.location.replace(BASE_ROUTER_PREFIX + routes.PROJECTS);
    }

    dispatch(actionHideLoading());
  } catch (error) {
    console.log(error);
    dispatch(actionHideLoading());
    actionLogout();
  }
};

export const actionGetToken = (code = '') => {
  let requestBody = new URLSearchParams();
  requestBody.append('grant_type', 'authorization_code');
  requestBody.append('client_id', CLIENT_ID);
  requestBody.append('code', code);
  requestBody.append('redirect_uri', LOGIN_CALLBACK_URI);

  return api({
    method: 'post',
    url: OIDC_ACCESS_TOKEN_URI || `${BASE_URL + ENDPOINT_KEYCLOAK}/token`,
    data: requestBody,
  });
};

export const actionGetPermissionToken = (token, listPermission) => {
  let requestBody = new URLSearchParams();
  requestBody.append(
    'grant_type',
    'urn:ietf:params:oauth:grant-type:uma-ticket'
  );
  requestBody.append('audience', AUDIENCE);

  (listPermission || TOKEN_PERMISSION).forEach((it) => {
    requestBody.append('permission', it);
  });

  return api({
    method: 'post',
    url: OIDC_ACCESS_TOKEN_URI || `${BASE_URL + ENDPOINT_KEYCLOAK}/token`,
    data: requestBody,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const actionRefreshToken = (refreshToken = '') => {
  let requestBody = new URLSearchParams();
  requestBody.append('grant_type', 'refresh_token');
  requestBody.append('client_id', CLIENT_ID);
  requestBody.append('refresh_token', refreshToken);
  requestBody.append('redirect_uri', LOGIN_CALLBACK_URI);

  return api({
    method: 'post',
    url: OIDC_ACCESS_TOKEN_URI || `${BASE_URL + ENDPOINT_KEYCLOAK}/token`,
    data: requestBody,
  });
};

export const requestLogin = () => {
  const pathAuth =
    OIDC_AUTHORIZATION_URI || `${BASE_URL + ENDPOINT_KEYCLOAK}/auth`;
  let loginUrl =
    pathAuth +
    '?client_id=' +
    CLIENT_ID +
    '&response_type=' +
    RESPONSE_TYPE +
    '&state=' +
    STATE +
    '&scope=' +
    SCOPE +
    '&redirect_uri=' +
    LOGIN_CALLBACK_URI;

  window.location.href = encodeURI(loginUrl);
};

export const actionLogout = async () => {
  try {
    localStorage.removeItem(VINLAB_VIEW_MODE);
    if (cookie.get(REFRESH_TOKEN) || cookie.get(FIRST_REFRESH_TOKEN)) {
      let requestBody = new URLSearchParams();
      requestBody.append('client_id', CLIENT_ID);
      requestBody.append('redirect_uri', LOGIN_CALLBACK_URI);
      requestBody.append(
        'refresh_token',
        cookie.get(REFRESH_TOKEN) || cookie.get(FIRST_REFRESH_TOKEN)
      );
      await api({
        method: 'post',
        url: OIDC_LOGOUT_URI || `${BASE_URL + ENDPOINT_KEYCLOAK}/logout`,
        data: requestBody,
      });
    }
    cookie.remove(TOKEN);
    cookie.remove(REFRESH_TOKEN);
    requestLogin();
  } catch (error) {
    cookie.remove(TOKEN);
    cookie.remove(REFRESH_TOKEN);
    requestLogin();
  }
};

export const checkRole = (profile, role = '') => {
  if (!profile || !role) return false;
  const { realm_roles = [] } = profile;
  return realm_roles.indexOf(role) > -1;
};

export const hasRolePO = (profile) => {
  return checkRole(profile, ROLES.PO) || checkRole(profile, ROLES.PO_PARTNER);
};

export const actionChangeViewMode = (viewmode) => async (dispatch) => {
  try {
    localStorage.setItem(VINLAB_VIEW_MODE, viewmode);
    dispatch({ type: actionType.CHANGE_VIEW_MODE, payload: viewmode });
  } catch (error) {}
};

export const isProjectOwner = (projectInfo, userInfo) => {
  if (!projectInfo || !userInfo) return false;
  const { people = [] } = projectInfo;
  const listPO = people.filter(
    (it) =>
      it.id === userInfo.sub &&
      (it?.roles || []).indexOf(USER_ROLES.PROJECT_OWNER) > -1
  );
  return (listPO || []).length > 0;
};

export const actionGetUsers = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: actionType.FETCHING_USERS, payload: true });
    const { data } = await api({
      method: 'get',
      url: '/api/accounts/userinfo',
      params,
    });
    dispatch({ type: actionType.FETCH_USERS, payload: data });
  } catch (error) {
    dispatch({ type: actionType.FETCHING_USERS, payload: false });
  }
};

export const actionGetListPermission = (token = '') => {
  return api({
    method: 'get',
    url: '/api/accounts/permissions',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const actionShowUploadModal = (uploadInfo = {}) => {
  return {
    type: actionType.SHOW_UPLOAD_MODAL,
    payload: uploadInfo,
  };
};
