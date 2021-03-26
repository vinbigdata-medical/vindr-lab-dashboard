import React, { useEffect, useState } from 'react';
import {
  Button,
  Select,
  message,
  Input,
  Form,
  Row,
  Col,
  Modal,
  Tooltip,
} from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  WORKFLOW_PROJECT,
  routes,
  USER_ROLES,
} from '../../../utils/constants/config';
import { isEmpty } from '../../../utils/helpers';
import {
  actionSetLabelGroups,
  actionGetLabelGroups,
} from '../../../components/labels/LabelsAction';
import {
  actionDeleteProject,
  actionUpdateProject,
  actionGetProjectDetail,
  actionUpdateUserToProject,
} from '../../project/ProjectAction';
import { actionGetUsers } from '../../system/systemAction';
import Labels from '../../../components/labels/Labels';
import AddEditGroup from '../../../components/labels/AddEditGroup';
import './Setting.scss';

const Setting = (props) => {
  const {
    currentProject = {},
    labelGroups,
    selectedLabelGroup,
    users = {},
    userInfo = {},
  } = props;
  const intl = useIntl();
  const { formatMessage: t } = intl;
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [annotatorList, setAnnotatorList] = useState([]);
  const [reviewerList, setReviewerList] = useState([]);
  const [poList, setPOList] = useState([]);

  useEffect(() => {
    props.actionGetLabelGroups();
    props.actionGetUsers();
    return () => {
      props.actionSetLabelGroups({});
    };
    // eslint-disable-next-line
  }, []);

  const getSelectedUsers = (people = [], role) => {
    let userIds = [];
    const listUser = people.filter(
      (usr) => (usr.roles || []).indexOf(role) >= 0
    );
    if (role === USER_ROLES.ANNOTATOR) {
      setAnnotatorList(listUser || []);
    } else if (role === USER_ROLES.REVIEWER) {
      setReviewerList(listUser || []);
    } else if (role === USER_ROLES.PROJECT_OWNER) {
      setPOList(listUser || []);
    }
    userIds = (listUser || []).map((it) => it.id);
    return userIds || [];
  };

  useEffect(() => {
    if (!isEmpty(currentProject)) {
      form.setFieldsValue({
        name: currentProject?.name || '',
        document_link: currentProject?.document_link || '',
        workflow: currentProject?.workflow,
        labeling_type: currentProject?.labeling_type,
        annotator_ids: getSelectedUsers(
          currentProject?.people,
          USER_ROLES.ANNOTATOR
        ),
        reviewer_ids: getSelectedUsers(
          currentProject?.people,
          USER_ROLES.REVIEWER
        ),
        project_owners_ids: getSelectedUsers(
          currentProject?.people,
          USER_ROLES.PROJECT_OWNER
        ),
      });
      if ((labelGroups?.data || []).length > 0) {
        if (isEmpty(selectedLabelGroup)) {
          const labelGroupId =
            (currentProject?.label_group_ids || []).length > 0
              ? currentProject?.label_group_ids[0]
              : '';
          const firstLabelGroup = labelGroups?.data[0] || {};
          const initSelected = (labelGroups?.data || []).find(
            (lb) => lb.id === labelGroupId
          );
          props.actionSetLabelGroups(initSelected || firstLabelGroup);
        } else {
          const firstLabelGroup = labelGroups?.data[0] || {};
          const updateSelected = (labelGroups?.data || []).find(
            (lb) => lb.id === selectedLabelGroup.id
          );
          props.actionSetLabelGroups(updateSelected || firstLabelGroup);
        }
      } else {
        props.actionSetLabelGroups({});
      }
    }
    // eslint-disable-next-line
  }, [labelGroups, currentProject]);

  useEffect(() => {
    if (!isEmpty(selectedLabelGroup)) {
      form.setFieldsValue({ label_group_ids: selectedLabelGroup.id });
    }
    // eslint-disable-next-line
  }, [selectedLabelGroup]);

  const handleUpdateProject = () => {
    if (processing || isEmpty(currentProject)) return;
    form
      .validateFields()
      .then(async (values) => {
        try {
          console.log(values);
          const putData = {
            ...currentProject,
            ...values,
            label_group_ids: [values.label_group_ids],
          };
          setProcessing(true);
          await actionUpdateProject(currentProject.id, putData);
          await actionUpdateUserToProject(currentProject.id, {
            people: [
              ...annotatorList.map((usr) => ({
                id: usr.value || usr.id,
                username: usr.children || usr.username,
                roles: [USER_ROLES.ANNOTATOR],
              })),
              ...reviewerList.map((usr) => ({
                id: usr.value || usr.id,
                username: usr.children || usr.username,
                roles: [USER_ROLES.REVIEWER],
              })),
              ...poList.map((usr) => ({
                id: usr.value || usr.id,
                username: usr.children || usr.username,
                roles: [USER_ROLES.PROJECT_OWNER],
              })),
            ],
          });
          props.actionGetProjectDetail(currentProject.id);
          message.success('Updated successfully!');
          setProcessing(false);
        } catch (error) {
          message.error('Error');
          setProcessing(false);
        }
      })
      .catch((error) => {});
  };

  const handleChangeLbGroup = (lbGroupId) => {
    const updateSelected = (labelGroups?.data || []).find(
      (lb) => lb.id === lbGroupId
    );
    props.actionSetLabelGroups(updateSelected || {});
  };

  const handleDeleteProject = () => {
    if (isEmpty(currentProject) || processing) return;
    Modal.confirm({
      title: 'Do you want to delete this project?',
      onOk: async () => {
        try {
          setProcessing(true);
          await actionDeleteProject(currentProject.id);
          message.success('Deleted successfully!');
          setProcessing(false);
          props.history.push(routes.PROJECTS);
        } catch (error) {
          setProcessing(false);
          message.error('Error!');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const handleOnChangeUser = (item = [], userRole) => {
    switch (userRole) {
      case USER_ROLES.ANNOTATOR:
        setAnnotatorList(item);
        break;
      case USER_ROLES.REVIEWER:
        setReviewerList(item);
        break;
      case USER_ROLES.PROJECT_OWNER:
        setPOList(item);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      document.getElementById('updateProject_annotator_ids').placeholder = t({
        id: 'IDS_SEARCH',
      });
      document.getElementById('updateProject_reviewer_ids').placeholder = t({
        id: 'IDS_SEARCH',
      });
      document.getElementById(
        'updateProject_project_owners_ids'
      ).placeholder = t({
        id: 'IDS_SEARCH',
      });
    }, 0);
  }, [t]);

  const SelectUser = (userRole) => (
    <Select
      bordered={false}
      mode="multiple"
      filterOption={(input, item) =>
        item.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      onChange={(_, item) => {
        handleOnChangeUser(item, userRole);
      }}
      dropdownAlign={{
        points: ['bl', 'tl'],
        offset: [0, -4],
        overflow: {
          adjustX: 0,
          adjustY: 1,
        },
      }}
    >
      {(users?.data || []).map((it) => (
        <Select.Option
          key={it.id}
          value={it.id}
          disabled={
            userRole === USER_ROLES.PROJECT_OWNER && it.id === userInfo.sub
          }
        >
          {it.username || ''}
        </Select.Option>
      ))}
    </Select>
  );
  return (
    <div className="setting-page">
      <div className="header-action">
        <div className="btn-update-project">
          <Button
            className="btn"
            type="primary"
            onClick={handleUpdateProject}
            htmlType="submit"
          >
            {t({ id: 'IDS_SAVE' })}
          </Button>
        </div>
      </div>
      <div className="setting-container">
        <Form
          form={form}
          name="updateProject"
          className="form-update-project"
          labelAlign="left"
          hideRequiredMark
          initialValues={{
            name: currentProject?.name || '',
            document_link: currentProject?.document_link || '',
            workflow: currentProject?.workflow,
            annotator_ids: currentProject?.annotator_ids || [],
            reviewer_ids: currentProject?.reviewer_ids || [],
            project_owners_ids: currentProject?.project_owners_ids || [],
          }}
          scrollToFirstError
          colon={false}
        >
          <div className="delete-project">
            <Button type="primary" danger onClick={handleDeleteProject}>
              {t({ id: 'IDS_DELETE_PROJECT' })}
            </Button>
          </div>
          <Form.Item
            name="name"
            label={t({ id: 'IDS_PROJECT_NAME' })}
            rules={[
              {
                required: true,
                whitespace: true,
              },
              {
                max: 255,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="document_link"
            label={t({ id: 'IDS_LABELING_INSTRUCTION' })}
            rules={[{ type: 'url' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="labeling_type"
            label={t({ id: 'IDS_LABELING_TYPE' })}
          >
            <Select>
              <Select.Option value="2D">2D</Select.Option>
              <Select.Option value="3D">3D</Select.Option>
            </Select>
          </Form.Item>
          <div className="assign-label-wrapper">
            <div className="session-title">
              {t({ id: 'IDS_LABEL_MANAGEMENT' })}
            </div>
            <div className="select-label-group">
              <Form.Item
                name="label_group_ids"
                rules={[{ required: true }]}
                className="form-item-lb-group"
              >
                <Select
                  placeholder="Select a label group"
                  onChange={handleChangeLbGroup}
                >
                  {(labelGroups?.data || []).map((lbg) => (
                    <Select.Option key={lbg?.id} value={lbg?.id}>
                      {lbg?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Tooltip title="Add label group">
                <Button
                  className="btn-add-label-group"
                  type="link"
                  icon={<PlusCircleOutlined />}
                  onClick={() => setVisibleModal(true)}
                />
              </Tooltip>
            </div>
            <div className="setting-labels">
              <Labels />
            </div>
          </div>
          <Form.Item
            className="workflow-item"
            name="workflow"
            label={<>{t({ id: 'IDS_WORKFLOW' })}</>}
            rules={[{ required: true }]}
            tooltip={{
              title: (
                <span className="tooltip-content">
                  <div>{t({ id: 'IDS_WORKFLOW_HELP_DES_1' })}</div>
                  <div>{t({ id: 'IDS_WORKFLOW_HELP_DES_2' })}</div>
                </span>
              ),
              overlayClassName: 'tooltip-workflow-help',
            }}
          >
            <Select>
              <Select.Option value={WORKFLOW_PROJECT.SINGLE}>
                {t({ id: 'IDS_SINGLE' })}
              </Select.Option>
              <Select.Option value={WORKFLOW_PROJECT.TRIANGLE}>
                {t({ id: 'IDS_TRIANGLE' })}
              </Select.Option>
            </Select>
          </Form.Item>
          <div className="assign-user-wrapper">
            <div className="session-title">
              {t({ id: 'IDS_USER_MANAGEMENT' })}
            </div>
            <Row className="select-users" gutter={24}>
              <Col sm={8} className="col-item">
                <div className="lb-input">{t({ id: 'IDS_ANNOTATOR' })}</div>
                <Form.Item name="annotator_ids">
                  {SelectUser(USER_ROLES.ANNOTATOR)}
                </Form.Item>
              </Col>
              <Col sm={8} className="col-item">
                <div className="lb-input">{t({ id: 'IDS_REVIEWER' })}</div>
                <Form.Item
                  name="reviewer_ids"
                  rules={[{ required: true, message: 'Please select users' }]}
                >
                  {SelectUser(USER_ROLES.REVIEWER)}
                </Form.Item>
              </Col>
              <Col sm={8} className="col-item">
                <div className="lb-input">{t({ id: 'IDS_PROJECT_OWNER' })}</div>
                <Form.Item
                  name="project_owners_ids"
                  rules={[{ required: true, message: 'Please select users' }]}
                >
                  {SelectUser(USER_ROLES.PROJECT_OWNER)}
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </div>
      {visibleModal && (
        <AddEditGroup
          onCancel={() => setVisibleModal(false)}
          onOk={(resData) => {
            props.actionGetLabelGroups();
            setVisibleModal(false);
            props.actionSetLabelGroups(resData);
          }}
        />
      )}
    </div>
  );
};

export default connect(
  (state) => ({
    users: state.system.users,
    userInfo: state.system.profile,
    isFetchingUser: state.system.isFetchingUser,
    labelGroups: state.label.labelGroups,
    selectedLabelGroup: state.label.selectedLabelGroup,
    currentProject: state.project.currentProject,
  }),
  {
    actionSetLabelGroups,
    actionGetLabelGroups,
    actionGetProjectDetail,
    actionGetUsers,
  }
)(withRouter(Setting));
