import api from '../../utils/service/api';
import * as actionType from '../../utils/constants/actions';

export const actionGetStudies = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: actionType.FETCHING_STUDIES, payload: true });
    const { data } = await api({
      method: 'get',
      url: '/api/studies',
      params,
    });
    dispatch({ type: actionType.FETCH_STUDIES, payload: data });
  } catch (error) {
    dispatch({ type: actionType.FETCHING_STUDIES, payload: false });
  }
};

export const actionGetTasks = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: actionType.FETCHING_TASKS, payload: true });
    const { data } = await api({
      method: 'get',
      url: '/api/tasks',
      params,
    });
    dispatch({ type: actionType.FETCH_TASKS, payload: data });
  } catch (error) {
    dispatch({ type: actionType.FETCHING_TASKS, payload: false });
  }
};

export const getTotalStatusTask = (params = {}) => {
  return api({
    method: 'get',
    url: '/api/tasks',
    params: {
      _offset: 0,
      _limit: 0,
      _agg: ['status', 'assignee_id'],
      ...params,
    },
  });
};

export const actionGetTotalStatus = (params = {}) => async (dispatch) => {
  try {
    const { data } = await api({
      method: 'get',
      url: '/api/studies',
      params: { _offset: 0, _limit: 0, _agg: 'status', ...params },
    });
    dispatch({ type: actionType.FETCH_STATS_STUDIES, payload: data || {} });
  } catch (error) {
    dispatch({ type: actionType.FETCH_STATS_STUDIES, payload: {} });
  }
};

export const actionUploadDICOM = (data = {}) => {
  return api({
    method: 'post',
    url: '/api/studies/upload',
    data,
  });
};

export const actionGetExportedVersions = (params = {}) => async (dispatch) => {
  try {
    const { data } = await api({
      method: 'get',
      url: '/api/stats/label_exports',
      params,
    });
    dispatch({ type: actionType.FETCH_EXPORTED_VERSIONS, payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const actionExportLabel = (data = {}) => {
  return api({
    method: 'post',
    url: '/api/stats/label_exports',
    data,
  });
};

export const actionDeleteStudy = (studyId) => {
  return api({
    method: 'delete',
    url: '/api/studies/' + studyId,
  });
};

export const actionDeleteStudies = (ids = []) => {
  return api({
    method: 'post',
    url: '/api/studies/delete_many',
    data: {
      ids,
    },
  });
};

export const actionCreateSession = (data = {}) => {
  return api({
    method: 'post',
    url: '/api/sessions',
    data,
  });
};

export const actionAssignTaskCondition = (data = {}) => {
  return api({
    method: 'post',
    url: '/api/tasks/assign',
    data,
  });
};

export const actionAssignTask = (data = {}) => {
  return api({
    method: 'post',
    url: '/api/tasks',
    data,
  });
};

export const actionUpdateTask = (taskId = '', data = {}) => {
  return api({
    method: 'put',
    url: '/api/tasks/' + taskId + '/status',
    data,
  });
};

export const actionReassignTasks = (data = {}) => {
  return api({
    method: 'post',
    url: '/api/tasks/update_status_many',
    data,
  });
};

export const actionDeleteTasks = (taskIds = []) => {
  return api({
    method: 'post',
    url: '/api/tasks/delete_many',
    data: {
      ids: taskIds,
    },
  });
};

export const actionDownloadLabel = async (downloadUrl) => {
  try {
    const res = await api({
      method: 'get',
      url: downloadUrl,
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/x-zip-compressed; charset=utf-8',
      },
    });

    const contentDisposition = res.headers['content-disposition'] || '';
    const fileName = contentDisposition.split('=').pop() || 'export_label.json';
    downloadFile(fileName, res.data);
  } catch (error) {
    console.log(error);
  }
};

export const downloadFile = (fileName, data) => {
  let anchor = document.createElement('a');
  const blob = new Blob([data]);
  let objectUrl = window.URL.createObjectURL(blob);
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(objectUrl);
};
