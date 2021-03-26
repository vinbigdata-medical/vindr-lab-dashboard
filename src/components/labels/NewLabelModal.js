import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Form,
  Modal,
  message,
  Input,
  Spin,
  Select,
  Popover,
  Button,
} from 'antd';
import { CirclePicker } from 'react-color';
import { useIntl } from 'react-intl';
import {
  DEFAULT_COLOR_PICKER,
  LABEL_SCOPE,
  LABEL_TYPE,
  ANNOTATION_TYPE,
} from '../../utils/constants/config';
import { actionCreateLabel } from './LabelsAction';

const { Option } = Select;

const NewLabelModal = (props) => {
  const {
    visible = true,
    onCancel,
    onOk,
    projectId,
    labels,
    selectedGroup,
  } = props;
  const [forceUpdate, setForceUpdate] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [color, setColor] = useState('#4caf50');
  const [parentList, setParentList] = useState([]);
  const [form] = Form.useForm();
  const { getFieldValue, resetFields } = form;
  const intl = useIntl();
  const { formatMessage: t } = intl;

  const onChangeLabelType = (value) => {
    resetFields(['parent_label_id', 'scope', 'annotation_type']);
    setParentList(labels?.data?.[value] || []);
  };

  const onChangeScope = (value) => {
    resetFields(['parent_label_id']);
    if (getFieldValue('type') === LABEL_TYPE[0].value) {
      const newParents = (labels?.data?.[LABEL_TYPE[0].value] || []).filter(
        (it) => it.scope === value
      );
      setParentList(newParents || []);
    }
  };

  const onChangeAnnotationType = (value) => {
    resetFields(['parent_label_id']);
    if (getFieldValue('type') === LABEL_TYPE[1].value) {
      const newParents = (labels?.data?.[getFieldValue('type')] || []).filter(
        (it) => it.annotation_type === value
      );
      setParentList(newParents || []);
    }
    setForceUpdate(1 - forceUpdate);
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
            ...values,
            name: values.name?.trim(),
            short_name: values.short_name?.trim() || '',
            description: values.description?.trim() || '',
            color: color,
            label_group_id: selectedGroup?.id,
          };
          console.log(values);
          await actionCreateLabel(dataDTO, projectId);
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

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  return (
    <Modal
      title={t({ id: 'IDS_NEW_LABEL' })}
      visible={visible}
      className="common-modal create-label-modal"
      onCancel={handleCancel}
      width={750}
      maskClosable={false}
      onOk={handleOk}
      okText={t({ id: 'IDS_CREATE' })}
      cancelText={t({ id: 'IDS_CANCEL' })}
    >
      <Spin spinning={processing}>
        <div className="new-label-modal">
          <Form {...layout} form={form} name="newLabel" hideRequiredMark>
            <Form.Item
              name="type"
              label={t({ id: 'IDS_TYPE' })}
              rules={[{ required: true }]}
            >
              <Select onChange={onChangeLabelType}>
                {LABEL_TYPE.map((it) => (
                  <Option key={it.value} value={it.value}>
                    {it.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="scope"
              label={t({ id: 'IDS_SCOPE' })}
              rules={[{ required: true }]}
            >
              <Select onChange={onChangeScope}>
                {LABEL_SCOPE.map((it) => (
                  <Option
                    key={it.value}
                    value={it.value}
                    disabled={getFieldValue('type') === it.isDisable}
                  >
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
              <Select
                disabled={!getFieldValue('type')}
                onChange={onChangeAnnotationType}
              >
                {ANNOTATION_TYPE.map((it) => (
                  <Option
                    key={it.value}
                    value={it.value}
                    disabled={getFieldValue('type') === it.isDisable}
                  >
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
              <Input />
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
              initialValue={'CHECKBOX'}
            >
              <Select>
                <Option value="CHECKBOX">
                  {t({ id: 'IDS_MULTIPLE_CHOICES' })}
                </Option>
                <Option value="RADIO">{t({ id: 'IDS_SINGLE_CHOICES' })}</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="parent_label_id"
              label={t({ id: 'IDS_PARENT_LABEL' })}
            >
              <Select disabled={!getFieldValue('annotation_type')} allowClear>
                {parentList.map((it) => (
                  <Option key={it.id} value={it.id}>
                    {it.name || ''}
                  </Option>
                ))}
              </Select>
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

export default connect(
  (state) => ({ labels: state.label.labels }),
  {}
)(NewLabelModal);
