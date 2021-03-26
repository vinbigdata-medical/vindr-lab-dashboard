import React, { useState } from 'react';
import { Form, Modal, message, Input, Spin } from 'antd';
import { actionCreateLabelGroup, actionUpdateLabelGroup } from './LabelsAction';

const AddEditGroup = (props) => {
  const { visible = true, onCancel, onOk, isEdit, selectedGroup = {} } = props;
  const [processing, setProcessing] = useState(false);
  const [form] = Form.useForm();

  const handleOk = (event) => {
    if (processing) return;
    event.stopPropagation();
    form
      .validateFields()
      .then(async (values) => {
        try {
          setProcessing(true);
          const dataDTO = {
            name: values.name?.trim(),
          };
          let resData = {};
          if (isEdit) {
            const { data } = await actionUpdateLabelGroup(
              selectedGroup.id,
              dataDTO
            );
            resData = data?.data || {};
          } else {
            const { data } = await actionCreateLabelGroup(dataDTO);
            resData = data?.data || {};
          }

          setProcessing(false);
          if (onOk) onOk(resData);
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
      title={isEdit ? 'Edit group' : 'New Group'}
      visible={visible}
      className="common-modal create-label-group-modal"
      onCancel={handleCancel}
      width={450}
      maskClosable={false}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
    >
      <Spin spinning={processing}>
        <div className="new-label-modal">
          <Form form={form} name="newLabelGroup" labelAlign="left">
            <Form.Item
              name="name"
              label="Name"
              initialValue={selectedGroup?.name || ''}
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
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default AddEditGroup;
