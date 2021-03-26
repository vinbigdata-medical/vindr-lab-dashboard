import { combineReducers } from 'redux';
import system from './system/systemReducer';
import study from './studyList/StudyListReducer';
import project from './project/ProjectReducer';
import label from '../components/labels/LabelsReducer';

const rootReducer = combineReducers({
  system,
  study,
  project,
  label
});

export default rootReducer;
