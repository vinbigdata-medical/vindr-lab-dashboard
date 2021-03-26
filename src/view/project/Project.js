import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Row, Col, Card, Tooltip, Button, Spin } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller';
import { useIntl } from 'react-intl';
import {
  routes,
  STUDY_TABS,
  USER_ROLES,
  STUDY_STATUS,
  TASK_STATUS,
} from '../../utils/constants/config';
import { isEmpty } from '../../utils/helpers';
import { getProjects } from './ProjectAction';
import { hasRolePO } from '../system/systemAction';
import CircularProgress from '../../components/circularProgress';
import CreateProjectModal from './CreateProjectModal';
import './Project.scss';

let params = { _offset: 0, _limit: 25 };
const Project = (props) => {
  const { history, userInfo, viewMode } = props;
  const { formatMessage: t } = useIntl();
  const [isOpenModal, setOpenModal] = useState(false);
  const [projectData, setProjectData] = useState({});
  const [isFetchingData, setFetchingData] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const isViewAsPO = viewMode === USER_ROLES.PROJECT_OWNER;

  useEffect(() => {
    if (!isEmpty(userInfo) && viewMode) {
      params.role = isViewAsPO
        ? [USER_ROLES.PROJECT_OWNER]
        : [USER_ROLES.ANNOTATOR, USER_ROLES.REVIEWER];

      params._offset = 0;
      handleGetProjects(params);
    }

    return () => {
      params = { _offset: 0, _limit: 25 };
    };
    // eslint-disable-next-line
  }, [userInfo, viewMode]);

  const handleGetProjects = async (newParams = {}, isLoadmore) => {
    try {
      setFetchingData(true);
      const { data = {} } = await getProjects({
        ...newParams,
        _offset: newParams._offset * newParams._limit,
      });

      if (isLoadmore) {
        const currentData = projectData?.data || [];
        const newData = [...currentData, ...(data.data || [])];
        setHasMore(newData.length < data.count);
        setProjectData({ ...data, data: newData });
      } else {
        setHasMore((data.data || []).length < data.count);
        setProjectData({ ...data });
      }

      setFetchingData(false);
    } catch (error) {
      console.log(error);
      setFetchingData(false);
    }
  };

  const handleClickProject = (projectId) => {
    history.push(routes.STUDY_LIST + '/' + projectId);
  };

  const createProjectSuccess = (project) => {
    setOpenModal(false);
    if (project?.data?.id) {
      props.history.push(
        routes.STUDY_LIST +
          '/' +
          project?.data?.id +
          '?tab=' +
          STUDY_TABS.SETTING.toLocaleLowerCase()
      );
    }
  };

  const handleGetStats = (data = {}) => {
    let total = 0;
    let numOfCompleted = 0;
    let content = '';

    try {
      Object.keys(data).forEach((key) => {
        total += data[key];
      });

      if (isViewAsPO) {
        numOfCompleted = data[STUDY_STATUS.COMPLETED] || 0;
        content = `${numOfCompleted}/${total} ${t({
          id: 'IDS_STUDIES_LOWER_CASE',
        })}`;
      } else {
        numOfCompleted = data[TASK_STATUS.COMPLETED] || 0;
        content = `${numOfCompleted}/${total} ${t({ id: 'IDS_TASKS' })}`;
      }
    } catch (error) {}

    const percent = (total === 0 ? 0 : numOfCompleted / total) * 100;

    return { total, numOfCompleted, percent: Math.round(percent), content };
  };

  return (
    <div className="common-style-page project-page">
      <div className="top-content">
        <div className="page-header">
          <div className="title">{t({ id: 'IDS_PROJECTS' })}</div>
          {hasRolePO(userInfo) && isViewAsPO && (
            <Tooltip title="Create project">
              <Button
                className="btn-create-project"
                type="link"
                onClick={() => setOpenModal(true)}
                icon={<PlusCircleOutlined />}
              />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="page-content">
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={() => {
            if (isFetchingData || !hasMore) return;
            params = { ...params, _offset: params._offset + 1 };
            handleGetProjects(params, true);
          }}
          hasMore={hasMore}
          useWindow={false}
        >
          <Row className="project-list" gutter={50}>
            {(projectData?.data || []).map((it) => {
              const stats = handleGetStats(it.meta) || {};
              return (
                <Col key={it.id}>
                  <Card
                    className="card-project"
                    hoverable
                    bordered={false}
                    cover={<CircularProgress percentage={stats.percent || 0} />}
                    onClick={() => handleClickProject(it.id)}
                  >
                    <Card.Meta
                      title={
                        <Tooltip title={it.description || ''}>
                          <span>{it.name}</span>
                        </Tooltip>
                      }
                      description={
                        <span>
                          {t({ id: 'IDS_COMPLETE' })}
                          <span className="total-study">
                            {stats.content || ''}
                          </span>
                        </span>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
          {isFetchingData && hasMore && (
            <div className="loading-project">
              <Spin />
            </div>
          )}
        </InfiniteScroll>
      </div>
      {isOpenModal && (
        <CreateProjectModal
          onCancel={() => setOpenModal(false)}
          onOk={createProjectSuccess}
        />
      )}
    </div>
  );
};

export default connect(
  (state) => ({
    userInfo: state.system.profile,
    viewMode: state.system.viewMode,
  }),
  {}
)(withRouter(Project));
