import React, { useState } from 'react';
import {
  Form,
  Modal,
  message,
  Input,
  Spin,
  Popover,
  Button,
  Select,
} from 'antd';
import { CirclePicker } from 'react-color';
import { useIntl } from 'react-intl';
import {
  DEFAULT_COLOR_PICKER,
  LABEL_SCOPE,
  LABEL_TYPE,
  ANNOTATION_TYPE,
} from '../../utils/constants/config';
import { isEmpty } from '../../utils/helpers';
import { actionUpdateLabel, actionDeleteLabel } from './LabelsAction';

const { Option } = Select;

const EditLabelModal = (props) => {
  const { visible = true, onCancel, onOk, item = {} } = props;
  const [processing, setProcessing] = useState(false);
  const [color, setColor] = useState(item?.color || '#4caf50');
  const [form] = Form.useForm();
  const intl = useIntl();
  const { formatMessage: t } = intl;

  const handleOk = (event) => {
    event.stopPropagation();
    if (processing || isEmpty(item)) return;
    form
      .validateFields()
      .then(async (values) => {
        try {
          setProcessing(true);
          const dataDTO = {
            name: values.name?.trim(),
            short_name: values.short_name?.trim() || '',
            description: values.description?.trim() || '',
            color: color,
          };
          await actionUpdateLabel(item.id, dataDTO);
          setProcessing(false);
          if (onOk) onOk();
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

  const handleDeleteLabel = async () => {
    try {
      setProcessing(true);
      await actionDeleteLabel(item.id);
      setProcessing(false);
      if (onOk) onOk();
    } catch (error) {
      message.error('Error');
      setProcessing(false);
    }
  };

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  return (
    <Modal
      title={t({ id: 'IDS_EDIT_LABEL' })}
      visible={visible}
      className="common-modal create-label-modal"
      onCancel={handleCancel}
      width={640}
      maskClosable={false}
      onOk={handleOk}
      footer={[
        <Button
          danger
          onClick={handleDeleteLabel}
          type="primary"
          className="btn-delete-label"
          key="delete"
        >
          {t({ id: 'IDS_DELETE' })}
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {t({ id: 'IDS_UPDATE' })}
        </Button>,
      ]}
    >
      <Spin spinning={processing}>
        <div className="new-label-modal">
          <Form
            {...layout}
            form={form}
            hideRequiredMark
            name="editLabel"
            initialValues={{
              type: item?.type || '',
              scope: item?.scope || '',
              annotation_type: item?.annotation_type || '',
              parent_name: item?.parent_name || '',
              name: item?.name || '',
              short_name: item?.short_name || '',
              description: item?.description || '',
              children_select_type: item?.children_select_type || 'CHECKBOX',
            }}
          >
            <Form.Item name="type" label={t({ id: 'IDS_TYPE' })}>
              <Select disabled>
                {LABEL_TYPE.map((it) => (
                  <Option key={it.value} value={it.value}>
                    {it.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="scope" label={t({ id: 'IDS_SCOPE' })}>
              <Select disabled>
                {LABEL_SCOPE.map((it) => (
                  <Option key={it.value} value={it.value}>
                    {it.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="annotation_type"
              label={t({ id: 'IDS_ANNOTATION_TYPE' })}
              rules={[{ required: true }]}
            >
              <Select disabled>
                {ANNOTATION_TYPE.map((it) => (
                  <Option key={it.value} value={it.value}>
                    {it.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
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
              <Input autoFocus />
            </Form.Item>
            <Form.Item name="short_name" label={t({ id: 'IDS_SHORT_NAME' })}>
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label={t({ id: 'IDS_DESCRIPTION' })}
              rules={[{ max: 255 }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="children_select_type"
              label={t({ id: 'IDS_FAMILY_TYPE' })}
            >
              <Select disabled>
                <Option value="CHECKBOX">
                  {t({ id: 'IDS_MULTIPLE_CHOICES' })}
                </Option>
                <Option value="RADIO">{t({ id: 'IDS_SINGLE_CHOICES' })}</Option>
              </Select>
            </Form.Item>
            <Form.Item name="parent_name" label={t({ id: 'IDS_PARENT_LABEL' })}>
              <Input disabled />
            </Form.Item>
            <Form.Item label="Color">
              <Popover
                content={
                  <CirclePicker
                    color={color}
                    colors={DEFAULT_COLOR_PICKER}
                    onChange={(newColor) => setColor(newColor.hex)}
                  />
                }
                trigger="click"
              >
                <Button
                  className="btn-pick-color"
                  style={{ background: color }}
                >
                  {' '}
                </Button>
              </Popover>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default EditLabelModal;
