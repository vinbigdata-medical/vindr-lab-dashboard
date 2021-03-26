import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Qs from 'qs';
import { Button } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import Data from './data/Data';
import Task from './task/Task';
import Setting from './setting/Setting';
import {
  actionGetProjectDetail,
  actionSetProjectDetail,
} from '../project/ProjectAction';
import { STUDY_TABS, USER_ROLES, routes } from '../../utils/constants/config';
import { isEmpty } from '../../utils/helpers';
import { isProjectOwner } from '../system/systemAction';
import './StudyList.scss';

const StudyList = (props) => {
  const { formatMessage: t } = useIntl();
  const [selectedTab, setSelectedTab] = useState({});

  const {
    match = {},
    userInfo,
    location = {},
    currentProject,
    viewMode,
  } = props;
  const urlParams = Qs.parse(location.search, { ignoreQueryPrefix: true });

  const projectId = match.params?.projectId;
  const isPO = isProjectOwner(currentProject, userInfo);
  const isViewAsPO = viewMode === USER_ROLES.PROJECT_OWNER;

  const tabList = [
    { key: STUDY_TABS.DATA, name: t({ id: 'IDS_DATA' }), isPO: true },
    { key: STUDY_TABS.TASK, name: t({ id: 'IDS_TASKS' }), isPO: true },
    { key: STUDY_TABS.SETTING, name: t({ id: 'IDS_SETTING' }), isPO: true },
    { key: STUDY_TABS.ANNOTATE, name: t({ id: 'IDS_ANNOTATE' }) },
    { key: STUDY_TABS.REVIEW, name: t({ id: 'IDS_REVIEW' }) },
  ];

  useEffect(() => {
    if (projectId) {
      props.actionGetProjectDetail(projectId);
    }
    return () => {
      props.actionSetProjectDetail({});
    };
    // eslint-disable-next-line
  }, [projectId]);

  useEffect(() => {
    if (!isEmpty(userInfo) && viewMode) {
      if (isViewAsPO) {
        if (urlParams?.tab === STUDY_TABS.SETTING.toLocaleLowerCase()) {
          handleReplaceState(tabList[2].key);
          setSelectedTab(tabList[2]);
        } else if (urlParams?.tab === STUDY_TABS.TASK.toLocaleLowerCase()) {
          handleReplaceState(tabList[1].key);
          setSelectedTab(tabList[1]);
        } else {
          handleReplaceState(tabList[0].key);
          setSelectedTab(tabList[0]);
        }
      } else {
        if (urlParams?.tab === STUDY_TABS.REVIEW.toLocaleLowerCase()) {
          handleReplaceState(tabList[4].key);
          setSelectedTab(tabList[4]);
        } else {
          handleReplaceState(tabList[3].key);
          setSelectedTab(tabList[3]);
        }
      }
    }
    // eslint-disable-next-line
  }, [viewMode, userInfo]);

  const handleReplaceState = (tab = '') => {
    window.history.replaceState(
      null,
      null,
      window.location.pathname + '?tab=' + tab.toLocaleLowerCase()
    );
  };

  const handleClickTab = (tab = {}) => {
    handleReplaceState(tab.key);
    setSelectedTab(tab);
  };

  if (isEmpty(userInfo) || isEmpty(currentProject)) return null;

  if (isViewAsPO && !isPO) {
    // not permission to view this project
    setTimeout(() => {
      props.history.push(routes.PROJECTS);
    }, 0);

    return null;
  }

  return (
    <div className="common-style-page study-list-page">
      <div className="top-content">
        <div className="page-header">
          <div className="tab-list">
            {tabList.map((tab) => {
              if (isViewAsPO && tab.isPO) {
                return (
                  <span
                    key={tab.key}
                    className={`tab-item ${
                      tab.key === selectedTab.key ? 'active-item' : ''
                    }`}
                    onClick={() => handleClickTab(tab)}
                  >
                    {tab.name}
                  </span>
                );
              } else if (!isViewAsPO && !tab.isPO) {
                return (
                  <span
                    key={tab.key}
                    className={`tab-item ${
                      tab.key === selectedTab.key ? 'active-item' : ''
                    }`}
                    onClick={() => handleClickTab(tab)}
                  >
                    {tab.name}
                  </span>
                );
              } else {
                return null;
              }
            })}
          </div>
        </div>
      </div>
      <div className="page-content">
        <div className="tab-content">
          {selectedTab.key === STUDY_TABS.DATA && isViewAsPO && (
            <Data projectId={projectId} />
          )}
          {(selectedTab.key === STUDY_TABS.TASK ||
            selectedTab.key === STUDY_TABS.ANNOTATE ||
            selectedTab.key === STUDY_TABS.REVIEW) && (
            <Task projectId={projectId} typeTask={selectedTab?.key} />
          )}
          {selectedTab.key === STUDY_TABS.SETTING && isViewAsPO && (
            <Setting projectId={projectId} />
          )}
        </div>
      </div>

      {currentProject?.document_link && (
        <div className="fixed-widgets">
          <Button
            type="primary"
            shape="circle"
            className="btn-open-guide"
            icon={<QuestionOutlined />}
            onClick={() => {
              window.open(currentProject?.document_link, '_blank');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default connect(
  (state) => ({
    userInfo: state.system.profile,
    viewMode: state.system.viewMode,
    currentProject: state.project.currentProject,
  }),
  { actionGetProjectDetail, actionSetProjectDetail }
)(withRouter(StudyList));
