import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Table, message, Input, Row, Col } from 'antd';
import {
  SearchOutlined,
  ContainerOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { useIntl } from 'react-intl';
import PaginationTable from '../../../components/pagination/Pagination';
import PopupContext from '../../../components/popupContext';
import {
  actionGetTasks,
  getTotalStatusTask,
  actionCreateSession,
  actionDeleteTasks,
  actionReassignTasks,
} from '../StudyListAction';
import {
  TASK_STATUS,
  SESSION_TYPE,
  STUDY_TABS,
  REDIRECT_VIEWER_URL,
  USER_ROLES,
} from '../../../utils/constants/config';
import './Task.scss';
import { isEmpty } from '../../../utils/helpers';
import { isProjectOwner } from '../../system/systemAction';

let params = { _offset: 0, _limit: 25 };

const Task = (props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowItems, setSelectedRowItems] = useState([]);
  const [totalStatus, setTotalStatus] = useState({});
  const [labelers, setLabelers] = useState([]);
  const [selectedLabeler, setSelectedLabeler] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(TASK_STATUS.ALL);
  const [processing, setProcessing] = useState(false);
  const { formatMessage: t } = useIntl();
  const [popupContext, setPopupContext] = useState({ visible: false });
  const {
    tasks,
    isFetchingTask,
    currentProject,
    projectId = '',
    typeTask,
    userInfo,
    viewMode,
  } = props;

  const isPO = isProjectOwner(currentProject, userInfo);
  const isViewAsPO = viewMode === USER_ROLES.PROJECT_OWNER;
  const refSearch = useRef('');

  useEffect(() => {
    return () => {
      params = { _offset: 0, _limit: 25 };
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (projectId && viewMode) {
      params = {
        _offset: 0,
        _limit: 25,
        project_id: projectId,
      };

      refSearch.current.state.value = '';
      setSelectedLabeler({});
      setSelectedStatus(TASK_STATUS.ALL);

      if (typeTask === STUDY_TABS.TASK) {
        params._role = USER_ROLES.PROJECT_OWNER;
      } else if (typeTask === STUDY_TABS.ANNOTATE) {
        params._role = USER_ROLES.ANNOTATOR;
        params.type = STUDY_TABS.ANNOTATE;
      } else {
        params._role = USER_ROLES.REVIEWER;
        params.type = STUDY_TABS.REVIEW;
      }

      handleFetchData(params);
      handleGetTotalStatus({ ...params, _offset: 0, _limit: 0 });
    }
    // eslint-disable-next-line
  }, [projectId, typeTask, viewMode]);

  const handleFetchData = (newParams = {}) => {
    props.actionGetTasks({
      ...newParams,
      _offset: newParams._offset * newParams._limit,
    });
  };

  const handleGetTotalStatus = async (newParams = {}) => {
    try {
      const { data = {} } = await getTotalStatusTask(newParams);
      const { agg = {} } = data;
      const { assignee_id = {} } = agg;

      if (!isEmpty(assignee_id)) {
        const result = Object.keys(assignee_id).map((usrId) => ({
          id: usrId,
          name: getUsername(usrId),
          total: assignee_id[usrId],
        }));
        setLabelers(result || []);
      }

      setTotalStatus(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUsername = (usrId = '') => {
    if (currentProject) {
      let userInfo = (currentProject?.people || []).find(
        (it) => it.id === usrId
      );
      return (userInfo || {}).username || usrId;
    } else {
      return usrId;
    }
  };

  const taskStatus = useMemo(() => {
    return [
      {
        id: TASK_STATUS.ALL,
        name: t({ id: 'IDS_ALL' }),
        icon: <ContainerOutlined />,
        total: totalStatus?.[TASK_STATUS.ALL] || 0,
      },
      {
        id: TASK_STATUS.NEW,
        name: t({ id: 'IDS_NEW' }),
        icon: <PlusCircleOutlined />,
        total: totalStatus?.agg?.status?.[TASK_STATUS.NEW] || 0,
      },
      {
        id: TASK_STATUS.DOING,
        name: t({ id: 'IDS_DOING' }),
        icon: <FormOutlined />,
        total: totalStatus?.agg?.status?.[TASK_STATUS.DOING] || 0,
      },
      {
        id: TASK_STATUS.COMPLETED,
        name: t({ id: 'IDS_COMPLETED' }),
        icon: <CheckCircleOutlined />,
        total: totalStatus?.agg?.status?.[TASK_STATUS.COMPLETED] || 0,
      },
    ];
  }, [totalStatus, t]);

  const columns = [
    {
      title: t({ id: 'IDS_TASK_CODE' }),
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
    },
    {
      title: t({ id: 'IDS_ASSIGNEE' }),
      dataIndex: 'assignee_id',
      key: 'assignee_id',
      ellipsis: true,
      render: (usrId) => <span>{getUsername(usrId)}</span>,
    },
    {
      title: t({ id: 'IDS_TYPE' }),
      dataIndex: 'type',
      key: 'type',
      ellipsis: true,
    },
    {
      title: t({ id: 'IDS_STUDY_CODE' }),
      dataIndex: 'studyCode',
      key: 'studyCode',
      ellipsis: true,
      render: (_, record) => <span>{record?.study?.code}</span>,
    },
    {
      title: t({ id: 'IDS_LAST_ACTIVITY' }),
      dataIndex: 'modified',
      key: 'modified',
      sorter: true,
      ellipsis: true,
      showSorterTooltip: false,
      width: 220,
      align: 'center',
      render: (txt) => (
        <span>{txt ? moment(txt).format('YYYY-MM-DD HH:mm') : ''}</span>
      ),
    },
    {
      title: t({ id: 'IDS_ARCHIVED' }),
      dataIndex: 'archived',
      key: 'archived',
      width: 120,
      align: 'center',
      render: (archived) => (
        <span className="task-archived">
          {archived ? t({ id: 'IDS_ARCHIVED' }) : ''}
        </span>
      ),
    },
    {
      title: t({ id: 'IDS_STATUS' }),
      dataIndex: 'status',
      key: 'status',
      width: 160,
      align: 'center',
      render: (status) => (
        <span className={`task-status ${status?.toLowerCase()}`}>
          {status?.toUpperCase()}
        </span>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (rowKeys, rowItems) => {
      setSelectedRowKeys(rowKeys);
      setSelectedRowItems(rowItems);
    },
  };

  const resetSelectedItem = () => {
    setSelectedRowKeys([]);
    setSelectedRowItems([]);
  };

  const handleCreateSession = async (task) => {
    if (processing) return;
    try {
      let listStudyUID = [];
      if (task) {
        listStudyUID = [
          {
            type: SESSION_TYPE.TASK,
            id: `${task?.project_id}.${
              (task?.study?.dicom_tags?.StudyInstanceUID || [])[0] || ''
            }`,
            meta: {
              project_id: task?.project_id,
              study_code: task?.code,
              study_id: task?.study?.id,
              project_name: currentProject?.name || '',
              task_id: task?.id,
            },
          },
        ];
      } else {
        listStudyUID = selectedRowItems.map((item) => ({
          type: SESSION_TYPE.TASK,
          id: `${item?.project_id}.${
            (item?.study?.dicom_tags?.StudyInstanceUID || [])[0] || ''
          }`,
          meta: {
            project_id: item?.project_id,
            study_code: item?.code,
            study_id: item?.study?.id,
            project_name: currentProject?.name || '',
            task_id: item?.id,
          },
        }));
      }

      setProcessing(true);
      const { data } = await actionCreateSession({ data: listStudyUID });
      setProcessing(false);
      const { session_id } = data?.data || {};
      if (session_id) {
        window.open(
          REDIRECT_VIEWER_URL + '/' + session_id + '?time=' + Date.now(),
          '_blank'
        );
      }
    } catch (error) {
      console.log(error);
      setProcessing(false);
      message.error('Error!');
    }
  };

  const onChangePagination = (page, size) => {
    params = { ...params, _offset: page - 1, _limit: size };
    resetSelectedItem();
    handleFetchData(params);
  };

  const handleTableChange = (_, filters, sorter) => {
    if (sorter?.order) {
      params._sort =
        sorter?.order === 'ascend' ? sorter.field : `-${sorter.field}`;
    } else {
      delete params._sort;
    }
    resetSelectedItem();
    handleFetchData(params);
  };

  const handleSearch = (e) => {
    if (e.keyCode === 13) {
      const value = e.target.value;
      if (value.trim()) {
        params = { ...params, _search: value.trim() };
      } else {
        delete params._search;
      }
      params._offset = 0;
      resetSelectedItem();
      handleFetchData(params);
    }
  };

  const handleActionReassign = async () => {
    if (processing || selectedRowKeys.length === 0) return;
    try {
      setProcessing(true);
      await actionReassignTasks({
        ids: selectedRowKeys,
        status: TASK_STATUS.NEW,
      });
      setProcessing(false);
      handleFetchData(params);
      resetSelectedItem();
    } catch (error) {
      console.log(error);
      message.error('Error');
      setProcessing(false);
    }
  };

  const handleActionUnassign = async () => {
    if (processing || selectedRowKeys.length === 0) return;
    try {
      setProcessing(true);
      await actionDeleteTasks(selectedRowKeys);
      params._offset = 0;
      handleFetchData(params);
      resetSelectedItem();
      setProcessing(false);
    } catch (error) {
      console.log(error);
      message.error('Error');
      setProcessing(false);
    }
  };

  const buttonList = [
    {
      id: 1,
      name: t({ id: 'IDS_OPEN' }),
      isDisable: selectedRowKeys?.length === 0,
      action: handleCreateSession,
    },
  ];

  if (isViewAsPO && isPO) {
    buttonList.push({
      id: 2,
      name: t({ id: 'IDS_REASSIGN' }),
      isDisable: selectedRowKeys?.length === 0,
      action: handleActionReassign,
    });
    buttonList.push({
      id: 3,
      name: t({ id: 'IDS_UNASSIGN' }),
      isDisable: selectedRowKeys?.length === 0,
      action: handleActionUnassign,
    });
  }

  const onFilterStatus = (status = {}) => {
    if (selectedStatus === status.id) return;
    setSelectedStatus(status.id);
    params._offset = 0;
    if (status.id === TASK_STATUS.ALL) {
      delete params.status;
    } else {
      params.status = status.id;
    }
    resetSelectedItem();
    handleFetchData(params);
  };

  return (
    <div className="task-page">
      <Row className="header-action">
        <Col xs={24} sm={24} lg={18} xl={20} className="col-item">
          <Input
            className="search-box"
            placeholder={t({ id: 'IDS_SEARCH' })}
            onKeyDown={handleSearch}
            prefix={<SearchOutlined />}
            ref={refSearch}
          />
        </Col>
      </Row>
      <Row className="task-container">
        <Col xs={24} sm={24} lg={18} xl={20} className="table-wrapper">
          <div className="header-table">
            <div className="top-btn-group">
              <div className="selected-info">
                <span className="label-txt">Select:</span>
                <span
                  className={`selected-item ${
                    selectedRowKeys.length > 0 ? 'active' : ''
                  }`}
                >
                  {selectedRowKeys.length || 0}
                </span>
                <span className="selected-item"> / {tasks?.count || 0}</span>
              </div>
              {selectedRowKeys.length > 0 &&
                buttonList.map((btn) => (
                  <Button
                    key={btn.id}
                    className="btn"
                    type="primary"
                    disabled={btn.isDisable}
                    onClick={() => btn.action()}
                  >
                    {btn.name}
                  </Button>
                ))}
            </div>
            {tasks?.count > 0 && (
              <PaginationTable
                page={params._offset}
                size={params._limit}
                onChange={onChangePagination}
                defaultPageSize={params._limit}
                totalElements={tasks.count || 0}
                onChangePageSize={(value) => {
                  params._offset = 0;
                  params._limit = value;
                  resetSelectedItem();
                  handleFetchData(params);
                }}
              />
            )}
          </div>
          <Table
            scroll={{ y: 'calc(100vh - 220px)' }}
            className="dark-table table-content"
            size="small"
            loading={isFetchingTask}
            rowKey={(record) => record.id}
            rowSelection={rowSelection}
            dataSource={tasks.data || []}
            columns={columns}
            pagination={false}
            onChange={handleTableChange}
            onRow={(record) => {
              return {
                onContextMenu: (event) => {
                  event.preventDefault();
                  if (selectedRowKeys.length === 0) return;

                  document.addEventListener(`click`, function onClickOutside() {
                    setPopupContext({
                      visible: false,
                    });
                    document.removeEventListener(`click`, onClickOutside);
                  });
                  setPopupContext({
                    visible: true,
                    x: event.clientX,
                    y: event.clientY,
                  });
                },
                onDoubleClick: (event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  if (event?._targetInst?.elementType === 'input') {
                    return;
                  }
                  handleCreateSession(record);
                },
              };
            }}
          />
        </Col>
        <Col xs={24} sm={24} lg={6} xl={4} className="right-panel">
          <div className="box-content">
            <div className="box-title">{t({ id: 'IDS_STATUS' })}</div>
            <div className="box-list">
              {taskStatus.map((it) => (
                <div
                  className={`box-item ${
                    selectedStatus === it.id ? 'is-active' : ''
                  }`}
                  key={it.id}
                  onClick={() => {
                    onFilterStatus(it);
                  }}
                >
                  <div className="ic-item">{it.icon}</div>
                  <div className="lb-name">{it.name}</div>
                  <div className="total">{it.total}</div>
                </div>
              ))}
            </div>
          </div>
          {isViewAsPO && isPO && (
            <div className="box-content">
              <div className="box-title">{t({ id: 'IDS_TASK_LABELERS' })}</div>
              <div className="box-list">
                {labelers?.map((lb) => (
                  <div
                    className={`box-item ${
                      selectedLabeler.id === lb.id ? 'is-active' : ''
                    }`}
                    key={lb.id}
                    onClick={() => {
                      params._offset = 0;
                      if (selectedLabeler.id === lb.id) {
                        setSelectedLabeler({});
                        delete params.assignee_id;
                      } else {
                        setSelectedLabeler(lb);
                        params.assignee_id = lb.id;
                      }
                      resetSelectedItem();
                      handleFetchData(params);
                    }}
                  >
                    <div className="ic-item">
                      <ContainerOutlined />
                    </div>
                    <div className="lb-name">{lb.name}</div>
                    <div className="total">{lb.total}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Row>
      <PopupContext buttonList={buttonList} {...popupContext} />
    </div>
  );
};

export default connect(
  (state) => ({
    tasks: state.study.tasks,
    isFetchingTask: state.study.isFetchingTask,
    currentProject: state.project.currentProject,
    userInfo: state.system.profile,
    viewMode: state.system.viewMode,
  }),
  { actionGetTasks }
)(withRouter(Task));
