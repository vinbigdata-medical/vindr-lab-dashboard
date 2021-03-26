import api from '../../utils/service/api';
import * as actionType from '../../utils/constants/actions';

export const actionGetLabels = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: actionType.FETCHING_LABELS, payload: true });
    const { data } = await api({
      method: 'get',
      url: '/api/labels',
      params,
    });
    dispatch({ type: actionType.FETCH_LABELS, payload: data });
  } catch (error) {
    dispatch({ type: actionType.FETCHING_LABELS, payload: false });
  }
};

export const getLabelList = (params = {}) => {
  return api({
    method: 'get',
    url: '/api/stats/agg_labels',
    params,
  });
};

export const actionGetLabelGroups = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: actionType.FETCHING_LABEL_GROUPS, payload: true });
    const { data } = await api({
      method: 'get',
      url: '/api/label_groups',
      params,
    });
    dispatch({ type: actionType.FETCH_LABEL_GROUPS, payload: data });
  } catch (error) {
    dispatch({ type: actionType.FETCHING_LABEL_GROUPS, payload: false });
  }
};

export const actionSetLabelGroups = (selectedGroup = {}) => async (
  dispatch
) => {
  dispatch({
    type: actionType.SET_SELECTED_LABEL_GROUPS,
    payload: selectedGroup,
  });
};

export const actionCreateLabel = (data = {}) => {
  return api({ method: 'post', url: '/api/labels', data });
};

export const actionUpdateLabel = (id = '', data = {}) => {
  return api({ method: 'put', url: '/api/labels/' + id, data });
};

export const actionDeleteLabel = (id = '') => {
  return api({ method: 'delete', url: '/api/labels/' + id });
};

export const actionCreateLabelGroup = (data = {}) => {
  return api({ method: 'post', url: '/api/label_groups', data });
};

export const actionUpdateLabelGroup = (id = '', data = {}) => {
  return api({ method: 'put', url: '/api/label_groups/' + id, data });
};

export const actionDeleteLabelGroup = (id = '') => {
  return api({ method: 'delete', url: '/api/label_groups/' + id });
};

export const actionAssignLabel = (data = {}, projectId) => {
  return api({ method: 'put', url: '/api/projects/' + projectId, data });
};

export const updateLabelOrder = (groupId = '', data = {}) => {
  return api({
    method: 'put',
    url: '/api/label_groups/' + groupId + '/update_order',
    data,
  });
};
