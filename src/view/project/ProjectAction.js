import api from '../../utils/service/api';
import * as actionType from '../../utils/constants/actions';

export const actionGetProjects = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: actionType.FETCHING_PROJECTS, payload: true });
    const { data } = await api({
      method: 'get',
      url: '/api/projects',
      params,
    });
    dispatch({ type: actionType.FETCH_PROJECTS, payload: data });
  } catch (error) {
    dispatch({ type: actionType.FETCHING_PROJECTS, payload: false });
  }
};

export const getProjects = (params = {}) => {
  return api({
    method: 'get',
    url: '/api/stats/projects_by_role',
    params,
  });
};

export const actionGetProjectDetail = (projectId = '') => async (dispatch) => {
  try {
    const { data } = await api({
      method: 'get',
      url: '/api/projects/' + projectId,
    });
    dispatch({
      type: actionType.FETCH_PROJECT_DETAIL,
      payload: data?.data || {},
    });
  } catch (error) {
    console.log(error);
  }
};

export const actionSetProjectDetail = (data = {}) => (dispatch) => {
  dispatch({
    type: actionType.FETCH_PROJECT_DETAIL,
    payload: data,
  });
};

export const actionDeleteProject = (id = '') => {
  return api({
    method: 'delete',
    url: '/api/projects/' + id,
  });
};

export const actionUpdateProject = (id = '', data = {}) => {
  return api({
    method: 'put',
    url: '/api/projects/' + id,
    data,
  });
};

export const actionUpdateUserToProject = (id = '', data = {}) => {
  return api({
    method: 'put',
    url: '/api/projects/' + id + '/people',
    data,
  });
};

export const actionCreateProject = (data = {}) => {
  return api({
    method: 'post',
    url: '/api/projects',
    data,
  });
};
