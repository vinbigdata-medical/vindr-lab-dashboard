import React, { useState } from 'react';
import { Form, Modal, message, Input, Spin, Select } from 'antd';
import { useIntl } from 'react-intl';
import { WORKFLOW_PROJECT } from '../../utils/constants/config';
import { actionCreateProject } from './ProjectAction';

const CreateProjectModal = (props) => {
  const { visible = true, onCancel, onOk } = props;
  const [processing, setProcessing] = useState(false);
  const [form] = Form.useForm();
  const intl = useIntl();
  const { formatMessage: t } = intl;

  const getProjectKey = (projectName = '') => {
    const words = projectName.split(' ');
    let chars = '';
    (words || []).some((it) => {
      let word = it?.trim() || '';
      if (chars.length === 5) return true;
      if (word) {
        for (let i = 0; i < word.length; i++) {
          if (word.substr(i, 1).match(/^[a-zA-Z]$/)) {
            chars += word.substr(i, 1).toUpperCase();
            break;
          }
        }
      }
      return false;
    });
    form.setFieldsValue({ key: chars });
  };

  const handleOk = (event) => {
    if (processing) return;
    event.stopPropagation();
    form
      .validateFields()
      .then(async (values) => {
        try {
          setProcessing(true);
          const dataDTO = {
            name: values?.name?.trim(),
            description: values?.description?.trim(),
            workflow: values?.workflow,
            labeling_type: values?.labeling_type || '2D',
          };
          if (values.key?.trim()) {
            dataDTO.key = values.key?.trim();
          }

          const { data } = await actionCreateProject(dataDTO);
          setProcessing(false);
          if (onOk) onOk(data);
        } catch (error) {
          message.error('Error');
          setProcessing(false);
        }
      })
      .catch((error) => {});
  };

  const handleCancel = () => {
    if (processing) return;
    if (onCancel) onCancel();
  };

  return (
    <Modal
      title={t({ id: 'IDS_CREATE_PROJECT' })}
      visible={visible}
      className="common-modal"
      onCancel={handleCancel}
      width={550}
      maskClosable={false}
      onOk={handleOk}
      okText={t({ id: 'IDS_CREATE' })}
      cancelText={t({ id: 'IDS_CANCEL' })}
    >
      <Spin spinning={processing}>
        <div className="create-project-modal">
          <Form
            form={form}
            name="createProject"
            labelAlign="left"
            hideRequiredMark
            colon={false}
          >
            <Form.Item
              name="name"
              label={t({ id: 'IDS_NAME' })}
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
              <Input
                onChange={(event) =>
                  getProjectKey(event?.target?.value?.trim())
                }
              />
            </Form.Item>
            <Form.Item
              name="description"
              label={t({ id: 'IDS_DESCRIPTION' })}
              rules={[{ max: 255 }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="workflow"
              label={<>{t({ id: 'IDS_WORKFLOW' })}</>}
              rules={[{ required: true }]}
              labelAlign="left"
              initialValue={WORKFLOW_PROJECT.SINGLE}
              tooltip={{
                title: (
                  <span className="tooltip-content">
                    <div>{t({ id: 'IDS_WORKFLOW_HELP_DES_1' })}</div>
                    <div>{t({ id: 'IDS_WORKFLOW_HELP_DES_2' })}</div>
                  </span>
                ),
                overlayClassName: 'tooltip-workflow-help',
                placement: 'right',
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
            <Form.Item
              name="labeling_type"
              label={<>{t({ id: 'IDS_LABELING_TYPE' })}</>}
              initialValue="2D"
            >
              <Select>
                <Select.Option value="2D">2D</Select.Option>
                <Select.Option value="3D">3D</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="key"
              label="Key"
              rules={[{ whitespace: true, pattern: /^[A-Z]+$/ }, { max: 5 }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default CreateProjectModal;
