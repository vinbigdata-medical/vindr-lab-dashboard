import * as actions from '../../utils/constants/actions';

const initialState = {
  labels: {},
  labelGroups: {},
  isFetchingLabels: false,
  isFetchingLabelGroups: false,
  selectedLabelGroup: {},
};

const label = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_LABELS:
      return { ...state, labels: action.payload, isFetchingLabels: false };
    case actions.FETCHING_LABELS:
      return { ...state, isFetchingLabels: action.payload };
    case actions.FETCH_LABEL_GROUPS:
      return {
        ...state,
        labelGroups: action.payload,
        isFetchingLabelGroups: false,
      };
    case actions.FETCHING_LABEL_GROUPS:
      return { ...state, isFetchingLabelGroups: action.payload };
    case actions.SET_SELECTED_LABEL_GROUPS:
      return { ...state, selectedLabelGroup: action.payload };
    default:
      return state;
  }
};

export default label;
