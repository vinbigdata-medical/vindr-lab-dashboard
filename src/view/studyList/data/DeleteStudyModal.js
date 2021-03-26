import React, { useState } from 'react';
import { Modal, message, Button, Spin } from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { actionDeleteStudies } from '../StudyListAction';
import { isEmpty } from '../../../utils/helpers';

const DeleteStudyModal = (props) => {
  const intl = useIntl();
  const { formatMessage: t } = intl;
  const { visible = true, onCancel, selectedRowKeys } = props;
  const [processing, setProcessing] = useState(false);
  const [deletedInfo, setDeletedInfo] = useState();

  const handleDelete = async () => {
    if (isEmpty(selectedRowKeys) || processing) return;

    try {
      setProcessing(true);
      const { data } = await actionDeleteStudies(selectedRowKeys);
      setDeletedInfo(data?.meta);
      setProcessing(false);
    } catch (error) {
      message.error('Error!');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel(!isEmpty(deletedInfo));
    }
  };

  const footerAction = () => {
    let btns = [
      <Button key="cancel" onClick={handleClose}>
        {t({ id: isEmpty(deletedInfo) ? 'IDS_NO' : 'IDS_CLOSE' })}
      </Button>,
    ];
    if (isEmpty(deletedInfo)) {
      btns.push(
        <Button
          key="submit"
          type="primary"
          danger
          onClick={handleDelete}
          className="btn-delete"
        >
          {t({ id: 'IDS_DELETE' })}
        </Button>
      );
    }
    return btns;
  };

  return (
    <Modal
      visible={visible}
      className="common-modal delete-modal"
      onCancel={handleClose}
      width={450}
      maskClosable={false}
      footer={footerAction()}
    >
      <Spin spinning={processing}>
        <div className="delete-modal-content">
          {isEmpty(deletedInfo) && (
            <div className="line-item">
              <span className="line-icon warning-icon">
                <ExclamationCircleOutlined />
              </span>
              <span className="msg">
                {t({ id: 'IDS_CONFIRM_DELETE_STUDY_MSG' })}
              </span>
            </div>
          )}
          {!isEmpty(deletedInfo) && (
            <>
              <div className="line-item">
                <span className="line-icon success-icon">
                  <CheckCircleOutlined />
                </span>
                <span className="msg">
                  {`${deletedInfo.deleted} files were deleted successfully.`}
                </span>
              </div>
              {deletedInfo?.not_deleted > 0 && (
                <>
                  <div className="line-item">
                    <span className="line-icon warning-icon">
                      <ExclamationCircleOutlined />
                    </span>
                    <span className="msg">
                      Some files were already assigned.
                    </span>
                  </div>
                  <div className="line-item">
                    <span className="line-icon error-icon">
                      <CloseCircleOutlined />
                    </span>
                    <span className="msg">Some files were deleted failed.</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default DeleteStudyModal;
