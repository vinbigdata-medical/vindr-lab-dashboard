import React, { useEffect, useState } from 'react';
import {
  Form,
  Modal,
  message,
  Input,
  Button,
  Table,
  Spin,
  Pagination,
} from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { useIntl } from 'react-intl';
import {
  actionExportLabel,
  actionGetExportedVersions,
  actionDownloadLabel,
} from '../StudyListAction';
import { CONFIG_SERVER } from '../../../utils/constants/config';

let downloadLabelUrl =
  CONFIG_SERVER.BASE_URL + '/api/stats/label_exports/download/';
let params = { _offset: 0, _limit: 10 };
let intervalExport = null;
const EXPORT_STATUS = {
  PENDING: 'PENDING',
  DONE: 'DONE',
};

const ExportLabelModal = (props) => {
  const { formatMessage: t } = useIntl();
  const [processing, setProcessing] = useState(false);
  const { visible = true, onCancel, exportedVersion, projectId } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    return () => {
      params = { _offset: 0, _limit: 10 };
      clearInterval(intervalExport);
    };
  }, []);

  useEffect(() => {
    if (projectId) {
      params = {
        ...params,
        _search: `project_id:${projectId}`,
      };
      handleGetExportedVersion(params);
    }
    // eslint-disable-next-line
  }, [projectId]);

  useEffect(() => {
    if (projectId && exportedVersion?.data) {
      const hasPending = (exportedVersion?.data || []).find(
        (it) => it.status === EXPORT_STATUS.PENDING
      );
      if (hasPending && !intervalExport) {
        intervalExport = setInterval(() => {
          handleGetExportedVersion(params);
        }, 1000);
      } else if (intervalExport) {
        clearInterval(intervalExport);
      }
    }
    // eslint-disable-next-line
  }, [projectId, exportedVersion]);

  const handleGetExportedVersion = (newParams = {}) => {
    props.actionGetExportedVersions({
      ...newParams,
      _offset: newParams._offset * newParams._limit,
    });
  };

  const handleOk = (event) => {
    if (processing) return;
    event.stopPropagation();
    form
      .validateFields()
      .then(async (values) => {
        try {
          const dataDTO = {
            tag: values.tag.trim(),
            project_id: projectId,
          };
          setProcessing(true);
          await actionExportLabel(dataDTO);
          params._offset = 0;
          handleGetExportedVersion(params);
          form.resetFields(['tag']);
          message.success('Creating file!');
          setProcessing(false);
        } catch (error) {
          const { data = {} } = error || {};
          message.error(data.message || 'System error');
          setProcessing(false);
        }
      })
      .catch((error) => {});
  };

  const columns = [
    {
      title: t({ id: 'IDS_VERSION_TAG' }),
      dataIndex: 'tag',
      key: 'tag',
    },
    {
      title: t({ id: 'IDS_DATE' }),
      dataIndex: 'created',
      key: 'created',
      render: (txt) => (
        <span>{txt ? moment(txt).format('YYYY-MM-DD HH:mm') : ''}</span>
      ),
    },
    {
      title: t({ id: 'IDS_STATUS' }),
      dataIndex: 'status',
      key: 'status',
      render: (txt) => {
        const status = (txt || '').toLocaleLowerCase();
        return <span className={`export-lb-status ${status}`}>{status}</span>;
      },
    },
    {
      title: t({ id: 'IDS_ACTION' }),
      width: 150,
      align: 'center',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          disabled={record?.status === EXPORT_STATUS.PENDING}
          onClick={() => {
            actionDownloadLabel(downloadLabelUrl + record?.id);
          }}
        >
          {t({ id: 'IDS_DOWNLOAD' })}
        </Button>
      ),
    },
  ];

  const onChangePagination = (page, size) => {
    params = { ...params, _offset: page - 1, _limit: size };
    handleGetExportedVersion(params);
  };

  return (
    <Modal
      title={t({ id: 'IDS_EXPORT_LABEL' })}
      visible={visible}
      className="common-modal"
      onCancel={onCancel}
      width={900}
      maskClosable={false}
      footer={[
        <Button key="submit" type="primary" onClick={handleOk}>
          {t({ id: 'IDS_EXPORT' })}
        </Button>,
      ]}
    >
      <Spin spinning={processing}>
        <div className="export-label-modal">
          <div className="exported-version">
            <div className="title">{t({ id: 'IDS_EXPORTED_VERSIONS' })}</div>
            <Table
              size="small"
              scroll={{ y: 250 }}
              rowKey={(record) => record.id}
              className="exported-table"
              dataSource={exportedVersion?.data || []}
              columns={columns}
              pagination={false}
            />
            <Pagination
              size="small"
              className="pagination-content"
              total={exportedVersion?.count || 0}
              current={params._offset + 1}
              pageSize={params._limit}
              showSizeChanger
              showLessItems={true}
              pageSizeOptions={[10, 20, 50]}
              onChange={onChangePagination}
            />
          </div>
          <div className="form-content">
            <div className="title">{t({ id: 'IDS_EXPORT_NEW_VERSION' })}</div>
            <Form form={form} name="exportLabel">
              <Form.Item
                name="tag"
                label={t({ id: 'IDS_TAG' })}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                  },
                  {
                    max: 255,
                    pattern: /^[\w.]+$/,
                  },
                ]}
                labelAlign="left"
              >
                <Input />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default connect(
  (state) => ({
    exportedVersion: state.study.exportedVersion,
    isFetching: state.study.isFetching,
  }),
  { actionGetExportedVersions }
)(ExportLabelModal);
