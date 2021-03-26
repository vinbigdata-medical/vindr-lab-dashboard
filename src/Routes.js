import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { routes } from './utils/constants/config';
import Project from './view/project/Project';
import StudyList from './view/studyList/StudyList';
import LabelManagement from './view/labelManagement/LabelManagement';

const Routes = (props) => {
  return (
    <Switch>
      {/* <Redirect exact from="/" to={routes.PROJECTS} /> */}
      <Route exact path={routes.PROJECTS} component={Project} />
      <Route exact path={routes.STUDY_LIST_ID} component={StudyList} />
      <Route exact path={routes.LABEL_MANAGEMENT} component={LabelManagement} />
    </Switch>
  );
};

export default Routes;
