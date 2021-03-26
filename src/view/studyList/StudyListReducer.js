import * as actions from '../../utils/constants/actions';

const initialState = {
  studies: {},
  isFetching: false,
  exportedVersion: {},
  isFetchingTask: false,
  tasks: {},
  totalStatus: {},
};

const study = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_STUDIES:
      return { ...state, studies: action.payload, isFetching: false };
    case actions.FETCHING_STUDIES:
      return { ...state, isFetching: action.payload };
    case actions.FETCH_TASKS:
      return { ...state, tasks: action.payload, isFetchingTask: false };
    case actions.FETCHING_TASKS:
      return { ...state, isFetchingTask: action.payload };
    case actions.FETCH_EXPORTED_VERSIONS:
      return { ...state, exportedVersion: action.payload };
    case actions.FETCH_STATS_STUDIES:
      return { ...state, totalStatus: action.payload };
    default:
      return state;
  }
};

export default study;
