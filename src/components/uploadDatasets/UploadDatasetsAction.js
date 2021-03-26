import api from '../../utils/service/api';

export const actionUploadDICOM = (data = {}, cancelToken) => {
  return api({
    method: 'post',
    url: '/api/studies/upload',
    data,
    cancelToken: cancelToken,
  });
};
