import React, { useEffect, useState } from 'react';
import {
  Form,
  Modal,
  message,
  Button,
  Spin,
  Select,
  Radio,
  InputNumber,
  Upload,
  Row,
  Col,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { actionAssignTaskCondition } from '../StudyListAction';
import { USER_ROLES, WORKFLOW_PROJECT } from '../../../utils/constants/config';

const { Option } = Select;

const STUDY_POOL = {
  SELECTED_ITEM: 'SELECTED',
  SEARCH_CONDITION: 'SEARCH',
  UPLOAD_FILE: 'FILE',
};

let studyInstanceUIDs = [];

const AssignLabelerModal = (props) => {
  const { formatMessage: t } = useIntl();
  const [form] = Form.useForm();

  const {
    visible = true,
    onCancel,
    searchCondition = {},
    selectedItem = [],
    currentProject = {},
  } = props;
  const [isProcessing, setProcessing] = useState(false);
  const [studyPool, setStudyPool] = useState('');
  const [reviewerList, setReviewList] = useState([]);
  const [annotatorList, setAnnotatorList] = useState([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    return () => {
      studyInstanceUIDs = [];
    };
  }, []);

  useEffect(() => {
    if (currentProject) {
      const annotators = (currentProject?.people || [])
        .filter((usr) => (usr.roles || []).indexOf(USER_ROLES.ANNOTATOR) >= 0)
        .map((it) => ({ ...it, label: it?.username, value: it?.id }));
      const reviewers = (currentProject?.people || [])
        .filter((usr) => (usr.roles || []).indexOf(USER_ROLES.REVIEWER) >= 0)
        .map((it) => ({ ...it, label: it?.username, value: it?.id }));

      setAnnotatorList(annotators || []);
      setReviewList(reviewers || []);
    }
    // eslint-disable-next-line
  }, [currentProject]);

  const handleOk = (event) => {
    event.stopPropagation();
    if (isProcessing || !currentProject.id) return;

    form
      .validateFields()
      .then(async (values) => {
        if (currentProject?.workflow === WORKFLOW_PROJECT.SINGLE) {
          if ((values.reviewer || []).length === 0) {
            message.error('You need at least 1 reviewer for Single workflow');
            return;
          }
        } else if (currentProject?.workflow === WORKFLOW_PROJECT.TRIANGLE) {
          if (
            (values.reviewer || []).length < 1 ||
            (values.annotator || []).length < 2
          ) {
            message.error(
              'You need at least 2 annotators, 1 reviewer for Triangle workflow'
            );
            return;
          }
        }

        setProcessing(true);
        try {
          const dataPost = {
            project_id: currentProject.id,
            assignee_ids: {
              REVIEW: values.reviewer,
              ANNOTATE: values.annotator,
            },
            strategy: values.strategy,
            source_type: values.source_type,
          };

          if (
            studyPool === STUDY_POOL.SELECTED_ITEM &&
            selectedItem.length > 0
          ) {
            dataPost.study_ids = selectedItem;
          } else if (
            studyPool === STUDY_POOL.UPLOAD_FILE &&
            studyInstanceUIDs.length > 0
          ) {
            dataPost.study_instance_uids = studyInstanceUIDs;
          } else if (studyPool === STUDY_POOL.SEARCH_CONDITION) {
            dataPost.search_query = {
              size: values.size,
              query: searchCondition._search || undefined,
              status: searchCondition.status || undefined,
            };
          }
          await actionAssignTaskCondition(dataPost);
          setProcessing(false);
          onCancel(true);
        } catch (error) {
          message.error('System error!');
          setProcessing(false);
        }
      })
      .catch((error) => {});
  };

  const handleChangeStudyPool = (value) => {
    setStudyPool(value);
  };

  const validFile = (file) => {
    const fileExt = (file.name || '').split('.').pop();
    const isTxtFile =
      file.type === 'text/plain' ||
      (fileExt || '').toLocaleLowerCase() === 'txt';
    const isLt2M = file.size > 0 && file.size / 1024 / 1024 < 2;
    return isTxtFile && isLt2M;
  };

  const normFile = (e) => {
    if (e && e.file && validFile(e.file) && e.file.status !== 'removed') {
      return e.file;
    }

    if (e.file.status === 'removed') {
      return undefined;
    }
    return (fileList.length > 0 && fileList[0]) || undefined;
  };

  const onRemoveFile = () => {
    studyInstanceUIDs = [];
    setFileList([]);
  };

  const onBeforeUpload = (file) => {
    try {
      if (validFile(file)) {
        studyInstanceUIDs = [];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          const fileResult = `${reader.result || ''}`.split('\n');
          studyInstanceUIDs = (fileResult || []).filter((it) => it);
          if (studyInstanceUIDs.length > 0) {
            setFileList([file]);
          } else {
            message.error('File error!');
          }
          setProcessing(false);
        };
        reader.onprogress = (ev) => {
          setProcessing(true);
        };
        reader.onerror = () => {
          message.error('File error!');
          setProcessing(false);
        };
        setFileList([file]);
      } else {
        message.error(
          'You can only upload TXT file and must smaller than 2MB!'
        );
      }
    } catch (error) {
      console.log(error);
    }

    return false;
  };

  return (
    <Modal
      title={t({ id: 'IDS_ASSIGN_LABELER' })}
      visible={visible}
      className="common-modal assign-labeler-modal"
      onCancel={onCancel}
      width={600}
      maskClosable={false}
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          disabled={isProcessing}
        >
          {t({ id: 'IDS_ASSIGN' })}
        </Button>,
      ]}
    >
      <Spin spinning={isProcessing}>
        <div className="form-content">
          <Form
            form={form}
            labelAlign="left"
            colon={false}
            requiredMark={false}
          >
            <Form.Item
              name="source_type"
              label="Study Pool"
              rules={[{ required: true }]}
            >
              <Select onChange={handleChangeStudyPool}>
                <Option
                  value={STUDY_POOL.SELECTED_ITEM}
                  disabled={!selectedItem.length}
                >
                  Selected studies
                </Option>
                <Option value={STUDY_POOL.SEARCH_CONDITION}>
                  Search condition
                </Option>
                <Option value={STUDY_POOL.UPLOAD_FILE}>Study UIDs file</Option>
              </Select>
            </Form.Item>

            {studyPool === STUDY_POOL.UPLOAD_FILE && (
              <Form.Item
                name="file"
                label="Select file"
                rules={[{ required: true }]}
                valuePropName="file"
                getValueFromEvent={normFile}
              >
                <Upload
                  name="selectFile"
                  multiple={false}
                  accept=".txt"
                  beforeUpload={onBeforeUpload}
                  onRemove={onRemoveFile}
                  fileList={fileList}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
            )}
            {studyPool === STUDY_POOL.SEARCH_CONDITION && (
              <Form.Item
                name="size"
                label="Number of study"
                initialValue={1}
                rules={[{ required: true }]}
              >
                <InputNumber min={1} />
              </Form.Item>
            )}
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="reviewer"
                  label="Reviewer"
                  rules={[{ required: true }]}
                >
                  <Select mode="multiple" placeholder="Please select reviewer">
                    {reviewerList.map((it) => (
                      <Option value={it.value} key={it.value}>
                        {it.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="annotator" label="Annotator">
                  <Select mode="multiple" placeholder="Please select annotator">
                    {annotatorList.map((it) => (
                      <Option value={it.value} key={it.value}>
                        {it.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="strategy"
              label="Strategy"
              rules={[{ required: true }]}
              initialValue="ALL"
            >
              <Radio.Group>
                <Radio value="ALL">All</Radio>
                <Radio value="EQUALLY">Equally</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default AssignLabelerModal;
