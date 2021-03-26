import cookie from 'js-cookie';
import { VINLAB_LOCALE } from '../../utils/constants/config';
import * as actions from '../../utils/constants/actions';

const initialState = {
  locale: cookie.get(VINLAB_LOCALE) || 'en',
  isLoading: false,
  profile: {},
  users: {},
  isFetchingUser: false,
  uploadInfoModal: {
    isShow: false,
    projectId: '',
    studyParams: {},
  },
  viewMode: '',
};

const system = (state = initialState, action) => {
  switch (action.type) {
    case actions.CHANGE_LANGUAGE:
      return { ...state, locale: action.payload };
    case actions.FETCHING_PROFILE:
      return { ...state, profile: action.payload };
    case actions.SHOW_LOADING:
      return { ...state, isLoading: true };
    case actions.HIDE_LOADING:
      return { ...state, isLoading: false };
    case actions.FETCH_USERS:
      return { ...state, users: action.payload, isFetchingUser: false };
    case actions.FETCHING_USERS:
      return { ...state, isFetchingUser: action.payload };
    case actions.CHANGE_VIEW_MODE:
      return { ...state, viewMode: action.payload };
    case actions.SHOW_UPLOAD_MODAL:
      return {
        ...state,
        uploadInfoModal: { ...state.uploadInfoModal, ...action.payload },
      };
    default:
      return state;
  }
};

export default system;
