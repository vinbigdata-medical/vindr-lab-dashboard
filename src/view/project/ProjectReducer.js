import * as actions from '../../utils/constants/actions';

const initialState = {
  projects: {},
  currentProject: {},
  isFetching: false,
};

const project = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_PROJECTS:
      return { ...state, projects: action.payload, isFetching: false };
    case actions.FETCHING_PROJECTS:
      return { ...state, isFetching: action.payload };
    case actions.FETCH_PROJECT_DETAIL:
      return { ...state, currentProject: action.payload };
    default:
      return state;
  }
};

export default project;
