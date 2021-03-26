import React, { useState } from 'react';
import { Modal } from 'antd';
import {
  CloseOutlined,
  MinusOutlined,
  UpCircleOutlined,
} from '@ant-design/icons';
import UploadDatasets from './index';

const ImportDataModal = (props) => {
  const { visible = true, onCancel, projectId } = props;
  const [processing, setProcessing] = useState(false);
  const [minimize, setMinimize] = useState(false);

  const handleCancel = () => {
    if (processing) return;
    if (onCancel) onCancel();
  };

  const handleMinimize = (isMinimize = false) => {
    setMinimize(isMinimize);
  };

  return (
    <Modal
      wrapClassName={`fixed-upload-modal ${minimize ? 'minimize-popup' : ''}`}
      visible={visible}
      className="common-modal import-data-modal"
      width={750}
      maskClosable={false}
      mask={!minimize}
      footer={null}
      closeIcon={
        <span className="btn-header">
          {minimize && (
            <UpCircleOutlined
              className="btn-ic btn-action"
              onClick={() => handleMinimize()}
            />
          )}
          {!minimize && (
            <>
              <MinusOutlined
                className="btn-ic btn-action"
                onClick={() => handleMinimize(true)}
              />
              <CloseOutlined
                className="btn-ic btn-close"
                onClick={handleCancel}
              />
            </>
          )}
        </span>
      }
    >
      <UploadDatasets
        projectId={projectId}
        onUploading={(isUploading) => {
          setProcessing(isUploading);
        }}
        isMinimize={minimize}
        onMinimize={() => handleMinimize(true)}
        onCancel={handleCancel}
      />
    </Modal>
  );
};

export default ImportDataModal;
