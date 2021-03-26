import React, { useState, useEffect, useMemo } from 'react';
import { Button, Table, message, Input, Row, Col } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  ContainerOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  FormOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { useIntl } from 'react-intl';
import ExportLabelModal from './ExportLabelModal';
import PaginationTable from '../../../components/pagination/Pagination';
import PopupContext from '../../../components/popupContext';
import {
  actionGetStudies,
  actionGetTotalStatus,
  actionCreateSession,
} from '../StudyListAction';
import { getLabelList } from '../../../components/labels/LabelsAction';
import { actionShowUploadModal, checkRole } from '../../system/systemAction';
import {
  STUDY_STATUS,
  SESSION_TYPE,
  REDIRECT_VIEWER_URL,
  ROLES,
} from '../../../utils/constants/config';
import './Data.scss';
import { isEmpty } from '../../../utils/helpers';
import DeleteStudyModal from './DeleteStudyModal';
import AssignLabelerModal from './AssignLabelerModal';

let params = { _offset: 0, _limit: 25 };
const TYPE_MODAL = {
  EXPORT_LABEL: 1,
  DELETE_STUDY: 2,
  ASSIGN_LABELER: 3,
};

const Data = (props) => {
  const {
    studies,
    isFetching,
    currentProject,
    projectId = '',
    uploadInfoModal = {},
    totalStatus = {},
    userInfo = {},
  } = props;

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowItems, setSelectedRowItems] = useState([]);
  const [labelList, setLabelList] = useState({});
  const intl = useIntl();
  const { formatMessage: t } = intl;
  const [popupContext, setPopupContext] = useState({ visible: false });
  const [selectedStatus, setSelectedStatus] = useState(STUDY_STATUS.ALL);
  const [typeModal, setTypeModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    handleGetTotalStatus();
    handleGetLabelList();
    return () => {
      params = { _offset: 0, _limit: 25 };
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (projectId) {
      params = {
        ...params,
        project_id: projectId,
      };
      handleFetchData(params);
    }
    // eslint-disable-next-line
  }, [projectId]);

  const handleFetchData = (newParams = {}) => {
    props.actionShowUploadModal({ studyParams: newParams });
    props.actionGetStudies({
      ...newParams,
      _offset: newParams._offset * newParams._limit,
    });
  };

  const handleGetTotalStatus = () => {
    props.actionGetTotalStatus({ project_id: projectId });
  };

  const handleGetLabelList = async () => {
    try {
      const { data } = await getLabelList({
        project_id: projectId,
        task_status: 'COMPLETED',
        study_status: 'COMPLETED',
      });
      if (!isEmpty(data?.data)) {
        const { agg = {} } = data;
        const lbData = data?.data || {};
        (lbData.FINDING || []).forEach(
          (v, idx) => (lbData.FINDING[idx].total = (agg.label_ids || {})[v.id])
        );
        (lbData.IMPRESSION || []).forEach(
          (v, idx) =>
            (lbData.IMPRESSION[idx].total = (agg.label_ids || {})[v.id])
        );
        setLabelList(lbData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const taskStatus = useMemo(() => {
    return [
      {
        id: STUDY_STATUS.ALL,
        name: t({ id: 'IDS_ALL' }),
        icon: <ContainerOutlined />,
        total: totalStatus?.[STUDY_STATUS.ALL] || 0,
      },
      {
        id: STUDY_STATUS.ASSIGNED,
        name: t({ id: 'IDS_ASSIGNED' }),
        icon: <PlusCircleOutlined />,
        total: totalStatus?.agg?.status?.[STUDY_STATUS.ASSIGNED] || 0,
      },
      {
        id: STUDY_STATUS.UNASSIGNED,
        name: t({ id: 'IDS_UNASSIGNED' }),
        icon: <FormOutlined />,
        total: totalStatus?.agg?.status?.[STUDY_STATUS.UNASSIGNED] || 0,
      },
      {
        id: STUDY_STATUS.COMPLETED,
        name: t({ id: 'IDS_COMPLETED' }),
        icon: <CheckCircleOutlined />,
        total: totalStatus?.agg?.status?.[STUDY_STATUS.COMPLETED] || 0,
      },
    ];
  }, [totalStatus, t]);

  const columns = [
    {
      title: t({ id: 'IDS_STUDY_CODE' }),
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
      sorter: true,
      showSorterTooltip: false,
    },
    {
      title: t({ id: 'IDS_STUDY_UID' }),
      dataIndex: 'dicom_tags.StudyInstanceUID',
      key: 'dicom_tags.StudyInstanceUID',
      ellipsis: true,
      render: (_, record) => {
        const studyInstanceUID = record?.dicom_tags?.StudyInstanceUID || [];
        return (
          <span>{studyInstanceUID.length > 0 ? studyInstanceUID[0] : ''}</span>
        );
      },
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
      title: t({ id: 'IDS_STATUS' }),
      dataIndex: 'status',
      key: 'status',
      width: 160,
      align: 'center',
      render: (status) => (
        <span className={`study-status ${status?.toLowerCase()}`}>
          {status}
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

  const handleRefreshData = () => {
    resetSelectedItem();
    handleFetchData(params);
    handleGetTotalStatus();
  };

  const showDeleteModal = () => {
    setTypeModal(TYPE_MODAL.DELETE_STUDY);
  };

  const handleCreateSession = async (study) => {
    if (processing) return;
    try {
      let listStudyUID = [];
      if (study) {
        listStudyUID = [
          {
            type: SESSION_TYPE.STUDY,
            id: `${study?.project_id}.${
              (study?.dicom_tags?.StudyInstanceUID || [])[0] || ''
            }`,
            meta: {
              project_id: study?.project_id,
              study_code: study?.code,
              study_id: study?.id,
              project_name: currentProject?.name || '',
            },
          },
        ];
      } else {
        listStudyUID = selectedRowItems.map((item) => ({
          type: SESSION_TYPE.STUDY,
          id: `${item?.project_id}.${
            (item?.dicom_tags?.StudyInstanceUID || [])[0] || ''
          }`,
          meta: {
            project_id: item?.project_id,
            study_code: item?.code,
            study_id: item?.id,
            project_name: currentProject?.name || '',
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

  const buttonList = [
    {
      id: 1,
      name: t({ id: 'IDS_OPEN' }),
      isDisable: selectedRowKeys?.length === 0,
      action: handleCreateSession,
    },
    {
      id: 2,
      name: t({ id: 'IDS_DELETE' }),
      isDisable: selectedRowKeys?.length === 0,
      danger: true,
      action: showDeleteModal,
    },
  ];

  const onFilterStatus = (status = {}) => {
    if (selectedStatus === status.id) return;
    setSelectedStatus(status.id);
    params._offset = 0;
    if (status.id === STUDY_STATUS.ALL) {
      delete params.status;
    } else {
      params.status = status.id;
    }
    resetSelectedItem();
    handleFetchData(params);
  };

  return (
    <div className="data-page">
      <Row className="header-action">
        <Col xs={24} sm={24} lg={18} xl={20} className="col-item">
          <Input
            className="search-box"
            placeholder={t({ id: 'IDS_SEARCH' })}
            onKeyDown={handleSearch}
            prefix={<SearchOutlined />}
          />
        </Col>
      </Row>
      <Row className="data-container">
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
                <span className="selected-item"> / {studies?.count || 0}</span>
              </div>
              <Button
                className="btn"
                type="primary"
                onClick={() => setTypeModal(TYPE_MODAL.ASSIGN_LABELER)}
              >
                {t({ id: 'IDS_ASSIGN' })}
              </Button>
              {selectedRowKeys.length > 0 &&
                buttonList.map((button) => (
                  <Button
                    key={button.id}
                    className="btn"
                    type="primary"
                    disabled={button.isDisable}
                    onClick={() => button.action()}
                    danger={button.danger}
                  >
                    {button.name}
                  </Button>
                ))}
            </div>
            {studies?.count > 0 && (
              <PaginationTable
                page={params._offset}
                size={params._limit}
                onChange={onChangePagination}
                totalElements={studies.count || 0}
                defaultPageSize={params._limit}
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
            className="dark-table table-content"
            size="small"
            loading={isFetching}
            rowKey={(record) => record.id}
            rowSelection={rowSelection}
            dataSource={studies.data || []}
            columns={columns}
            pagination={false}
            onChange={handleTableChange}
            scroll={{ y: 'calc(100vh - 220px)' }}
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
          <div className="right-btn-group">
            <Button
              type="primary"
              disabled={
                processing ||
                uploadInfoModal.isShow ||
                checkRole(userInfo, ROLES.PO_PARTNER)
              }
              className="btn-action btn-import"
              onClick={() => {
                props.actionShowUploadModal({
                  isShow: true,
                  projectId: projectId,
                  studyParams: params,
                });
              }}
            >
              {t({ id: 'IDS_IMPORT_DATA' })}
            </Button>
            <Button
              type="primary"
              ghost
              className="btn-action"
              onClick={() => setTypeModal(TYPE_MODAL.EXPORT_LABEL)}
            >
              {t({ id: 'IDS_EXPORT_LABEL' })}
            </Button>
          </div>

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
          {((labelList?.FINDING || []).length > 0 ||
            (labelList?.IMPRESSION || []).length > 0) && (
            <div className="box-content">
              <div className="box-title">{t({ id: 'IDS_LABELS' })}</div>
              <div className="box-list">
                {labelList?.FINDING?.map((lb) => (
                  <div className="box-item" key={lb.id}>
                    <div className="lb-name" style={{ color: lb?.color }}>
                      {lb.name}
                    </div>
                    <div className="total">{lb.total || 0}</div>
                  </div>
                ))}
                {labelList?.IMPRESSION?.map((lb) => (
                  <div className="box-item" key={lb.id}>
                    <div className="lb-name" style={{ color: lb?.color }}>
                      {lb.name}
                    </div>
                    <div className="total">{lb.total || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Row>
      {typeModal === TYPE_MODAL.EXPORT_LABEL && (
        <ExportLabelModal
          projectId={projectId}
          onOk={() => setTypeModal(null)}
          onCancel={() => setTypeModal(null)}
        />
      )}
      {typeModal === TYPE_MODAL.DELETE_STUDY && (
        <DeleteStudyModal
          selectedRowKeys={selectedRowKeys}
          onCancel={(needResfresh) => {
            if (needResfresh) {
              params._offset = 0;
              handleRefreshData();
            }
            setTypeModal(null);
          }}
        />
      )}
      {typeModal === TYPE_MODAL.ASSIGN_LABELER && (
        <AssignLabelerModal
          onCancel={(needResfresh) => {
            if (needResfresh) {
              handleRefreshData();
            }
            setTypeModal(null);
          }}
          searchCondition={params}
          selectedItem={selectedRowKeys}
          currentProject={currentProject}
        />
      )}
      <PopupContext
        buttonList={[
          {
            id: 3,
            name: t({ id: 'IDS_ASSIGN' }),
            action: () => {
              setTypeModal(TYPE_MODAL.ASSIGN_LABELER);
            },
          },
          ...buttonList,
        ]}
        {...popupContext}
      />
    </div>
  );
};

export default connect(
  (state) => ({
    studies: state.study.studies,
    isFetching: state.study.isFetching,
    totalStatus: state.study.totalStatus,
    currentProject: state.project.currentProject,
    uploadInfoModal: state.system.uploadInfoModal,
    userInfo: state.system.profile,
  }),
  { actionGetStudies, actionShowUploadModal, actionGetTotalStatus }
)(withRouter(Data));
