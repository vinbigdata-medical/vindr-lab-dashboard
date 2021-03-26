import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Spin, Form, Input, message, Tooltip } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import {
  actionGetLabelGroups,
  actionCreateLabelGroup,
  actionSetLabelGroups,
} from './LabelsAction';
import './Labels.scss';

const LabelGroups = (props) => {
  const intl = useIntl();
  const { formatMessage: t } = intl;
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [isAdding, setAdding] = useState(false);

  const {
    labelGroups,
    isFetchingLabelGroups,
    selectedLabelGroup,
    actionSetLabelGroups,
  } = props;

  useEffect(() => {
    handleGetLabelGroups();
    return () => {
      actionSetLabelGroups({});
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if ((labelGroups?.data || []).length > 0) {
      const firstLabelGroup = labelGroups?.data[0] || {};
      const updateSelected = (labelGroups?.data || []).find(
        (lb) => lb.id === selectedLabelGroup.id
      );
      actionSetLabelGroups(updateSelected || firstLabelGroup);
    } else {
      actionSetLabelGroups({});
    }
    // eslint-disable-next-line
  }, [labelGroups]);

  const handleGetLabelGroups = () => {
    props.actionGetLabelGroups();
  };

  const handleAddLabelGroup = () => {
    if (processing) return;
    form
      .validateFields()
      .then(async (values) => {
        try {
          setProcessing(true);
          const { data } = await actionCreateLabelGroup({
            name: values.name?.trim(),
          });
          form.resetFields(['name']);
          handleGetLabelGroups();
          setProcessing(false);
          actionSetLabelGroups(data?.data || {});
        } catch (error) {
          message.error('Error');
          setProcessing(false);
        }
      })
      .catch((error) => {});
  };

  return (
    <div className="label-groups">
      <div className="header-label-groups">
        <div className="lb-title">{t({ id: 'IDS_LABEL_GROUPS' })}</div>
        <Tooltip title="Add label group">
          <Button
            className="btn-add-label-group"
            type="link"
            onClick={() => setAdding(true)}
            icon={<PlusCircleOutlined />}
          />
        </Tooltip>
      </div>
      <Spin spinning={isFetchingLabelGroups}>
        <div className="label-groups-content">
          {isAdding && (
            <Form form={form} name="newLabelGroup" className="form-lb-group">
              <Form.Item
                name="name"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: t({ id: 'IDS_PLEASE_ENTER_NAME' }),
                  },
                  {
                    max: 255,
                  },
                ]}
              >
                <Input.Search
                  onSearch={() => handleAddLabelGroup()}
                  enterButton={t({ id: 'IDS_ADD' })}
                  placeholder={t({ id: 'IDS_ENTER_GROUP_NAME' })}
                  autoComplete="off"
                  className="input-add-lb-group"
                  autoFocus
                />
              </Form.Item>
            </Form>
          )}
          <div className="lb-group-list">
            {(labelGroups?.data || []).map((it) => (
              <div
                className={`lb-group-item ${
                  selectedLabelGroup.id === it.id ? 'active-item' : ''
                }`}
                key={it.id}
                onClick={() => actionSetLabelGroups(it)}
              >
                {it.name}
              </div>
            ))}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default connect(
  (state) => ({
    labelGroups: state.label.labelGroups,
    isFetchingLabelGroups: state.label.isFetchingLabelGroups,
    selectedLabelGroup: state.label.selectedLabelGroup,
  }),
  { actionGetLabelGroups, actionSetLabelGroups }
)(LabelGroups);
