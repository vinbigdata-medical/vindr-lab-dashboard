import React, { useState, useEffect } from 'react';
import { Button, Progress } from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  CloseOutlined,
  CheckOutlined,
  ExclamationOutlined,
  FolderOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { actionUploadDICOM } from './UploadDatasetsAction';
import {
  actionGetStudies,
  actionGetTotalStatus,
} from '../../view/studyList/StudyListAction';
import './UploadDatasets.scss';
import { List } from 'react-virtualized';
const { default: PQueue } = require('p-queue');
const queue = new PQueue({ concurrency: 4 });

const acceptType = '.dcm, .dicom';
const UPLOAD_STATUS = {
  NONE: 'none',
  UPLOADING: 'uploading',
  DONE: 'done',
  ERROR: 'error',
};

let count = 0;
let subscribersCancel = [];

const UploadDatasets = (props) => {
  const {
    projectId,
    isMinimize = false,
    uploadInfoModal,
    location = {},
    onCancel,
  } = props;
  const intl = useIntl();
  const { formatMessage: t } = intl;
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [itemUploaded, setItemUploaded] = useState(0);
  const [isUploaded, setUploaded] = useState(false);
  const [isFinish, setIsFinish] = useState(false);

  useEffect(() => {
    return () => {
      count = 0;
      subscribersCancel = [];
    };
  }, []);

  useEffect(() => {
    if (itemUploaded === fileList?.length && fileList?.length > 0) {
      setIsFinish(true);
      if (location?.pathname?.indexOf(uploadInfoModal?.projectId) >= 0) {
        const { studyParams = {} } = uploadInfoModal;
        props.actionGetStudies({
          ...studyParams,
          _offset: studyParams._offset * studyParams._limit,
          project_id: uploadInfoModal?.projectId,
        });
        props.actionGetTotalStatus({ project_id: uploadInfoModal?.projectId });
      }
      setUploading(false);
    }
    // eslint-disable-next-line
  }, [itemUploaded]);

  useEffect(() => {
    if (props.onUploading) {
      props.onUploading(uploading);
    }
    // eslint-disable-next-line
  }, [uploading]);

  useEffect(() => {
    const dragBox = document.getElementById('dragBox');
    [
      'drag',
      'dragstart',
      'dragend',
      'dragover',
      'dragenter',
      'dragleave',
      'drop',
    ].forEach(function (event) {
      dragBox.addEventListener(event, function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    ['dragover', 'dragenter'].forEach(function (event) {
      dragBox.addEventListener(event, function () {
        dragBox.classList.add('is-dragover');
      });
    });
    ['dragleave', 'dragend', 'drop'].forEach(function (event) {
      dragBox.addEventListener(event, function () {
        dragBox.classList.remove('is-dragover');
      });
    });
    dragBox.addEventListener('drop', function (e) {
      addFiles(e.dataTransfer.files, true);
    });
    // eslint-disable-next-line
  }, []);

  const onCLickDeleteFile = (file, idx) => {
    if (uploading) return;
    let tempFileList = [...fileList];
    tempFileList.splice(idx, 1);
    setFileList([...tempFileList]);
  };

  const handleUploadFile = () => {
    if (isUploaded || uploading || fileList.length === 0) return;
    const CancelToken = axios.CancelToken;

    setUploaded(true);
    setUploading(true);

    let fileListUpload = [...fileList];

    fileListUpload.forEach(async (file, idx) => {
      fileListUpload[idx].status = UPLOAD_STATUS.UPLOADING;
      setFileList([...fileListUpload]);
      const formData = new FormData();
      formData.append('file', file?.originFileObj);
      formData.append('project_id', projectId);
      try {
        await queue.add(() =>
          actionUploadDICOM(
            formData,
            new CancelToken(function executor(c) {
              subscribersCancel.push(c);
            })
          )
        );

        fileListUpload[idx].status = UPLOAD_STATUS.DONE;
        setFileList([...fileListUpload]);
        count++;
        setItemUploaded(count);
      } catch (error) {
        fileListUpload[idx].status = UPLOAD_STATUS.ERROR;
        fileListUpload[idx].error_msg = error?.data?.message || '';
        setFileList([...fileListUpload]);
        count++;
        setItemUploaded(count);
      }
    });
  };

  const handleStop = () => {
    if (subscribersCancel.length === 0) return;
    subscribersCancel.forEach((cancelRequest) => {
      cancelRequest && cancelRequest();
    });
    subscribersCancel = [];
    queue.clear();
    setUploading(false);
  };

  const convertArrToCSV = (data = []) => {
    if (!data || !data.length) return;
    let result = '';
    result += `File name, Type, Error message\n`;
    data.forEach((item) => {
      result += `${item?.name || ''}, ${item?.status || ''}, ${
        item?.error_msg || ''
      }\n`;
    });

    return result;
  };

  const handleExportLog = () => {
    let csv = convertArrToCSV(fileList);
    if (!csv) return;

    const filename = `${moment().format('YYYY_MM_DD')}_upload_log.csv`;
    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }

    const data = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  };

  const addFiles = (files = [], isSelectFile) => {
    const filesTemp = [];
    const filesArray = Array.from(files);
    filesArray.forEach((file, idx) => {
      filesTemp.push({
        fileId: idx,
        name: file.name,
        originFileObj: file,
      });
    });
    if (isSelectFile) {
      setFileList([...fileList, ...filesTemp]);
    } else {
      setFileList(filesTemp);
    }
  };

  const onChangeFile = (event, isSelectFile) => {
    console.log(event);
    if (!event?.target?.files?.length) return;
    addFiles(event.target.files, isSelectFile);
  };

  const onSelectFile = (isSelectFolder) => {
    if (isSelectFolder) {
      document.getElementById('folderId').click();
    } else {
      document.getElementById('fileId').click();
    }
  };

  const rowRenderer = ({ key, index, isScrolling, isVisible, style }) => {
    const file = fileList[index];
    return (
      <div key={key} style={{ ...style, padding: '0 5px' }}>
        <div className="file-item">
          <span className="file-icon">
            <FileOutlined />
          </span>
          <span className="file-name">{file.name}</span>
          <span
            className={`file-status ${file.status}`}
            onClick={() => onCLickDeleteFile(file, index)}
          >
            {(!file.status || file.status === UPLOAD_STATUS.NONE) && (
              <CloseOutlined />
            )}
            {file.status === UPLOAD_STATUS.UPLOADING && (
              <LoadingOutlined className="ic-uploading" />
            )}
            {file.status === UPLOAD_STATUS.DONE && <CheckOutlined />}
            {file.status === UPLOAD_STATUS.ERROR && <ExclamationOutlined />}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="import-data-content">
      <div className="header-modal">
        <span className="header-title">{t({ id: 'IDS_IMPORT_DATA' })}</span>
        {isUploaded && (
          <span className="uploaded-info">{`(${itemUploaded}/${fileList.length} files)`}</span>
        )}
      </div>
      {isMinimize && (
        <div className="progress-bar">
          <Progress
            percent={
              fileList.length === 0 ? 0 : (itemUploaded / fileList.length) * 100
            }
            showInfo={false}
          />
        </div>
      )}
      <div className="upload-container">
        <input
          className="input-file"
          type="file"
          id="folderId"
          webkitdirectory="true"
          mozdirectory="true"
          directory="true"
          onChange={(evt) => onChangeFile(evt)}
          onClick={(event) => (event.target.value = null)}
        />
        <input
          className="input-file"
          type="file"
          multiple
          onChange={(evt) => onChangeFile(evt, true)}
          id="fileId"
          accept={acceptType}
          onClick={(event) => (event.target.value = null)}
        />
        <div
          className={`upload-drag-box ${
            fileList.length > 0 ? 'hide-drag-box' : ''
          }`}
        >
          <div className="drag-box" id="dragBox" onClick={() => onSelectFile()}>
            <div className="drag-content">
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                {t({ id: 'IDS_DRAG_BOX_UPLOAD_TITLE' })}
              </p>
              <p className="ant-upload-hint">
                {t({ id: 'IDS_DRAG_BOX_UPLOAD_DESCRIPTION' })}
              </p>
            </div>
          </div>
          {fileList.length > 0 && (
            <div className="file-list">
              <List
                width={580}
                height={400}
                rowCount={fileList.length}
                rowHeight={43}
                rowRenderer={rowRenderer}
              />
            </div>
          )}
        </div>
        <div className="btn-action">
          {!isUploaded && (
            <>
              <Button
                icon={<FolderOutlined />}
                ghost
                disabled={uploading}
                className="btn btn-select-file"
                onClick={() => onSelectFile(true)}
              >
                {t({ id: 'IDS_SELECT_FOLDER' })}
              </Button>
              <Button
                icon={<UploadOutlined />}
                ghost
                disabled={uploading}
                className="btn btn-select-file"
                onClick={() => onSelectFile()}
              >
                {t({ id: 'IDS_SELECT_FILE' })}
              </Button>
              <Button
                type="primary"
                loading={uploading}
                onClick={handleUploadFile}
                className="btn btn-primary"
              >
                {t({ id: 'IDS_START_UPLOAD' })}
              </Button>
            </>
          )}
          {isUploaded && !isFinish && (
            <>
              <Button
                className="btn btn-stop"
                type="primary"
                danger
                onClick={handleStop}
              >
                {t({ id: 'IDS_STOP' })}
              </Button>
              <Button
                type="primary"
                className="btn btn-primary"
                onClick={() => {
                  if (props.onMinimize) {
                    props.onMinimize();
                  }
                }}
              >
                {t({ id: 'IDS_MINIMIZE' })}
              </Button>
            </>
          )}
          {isUploaded && isFinish && (
            <>
              <Button
                type="primary"
                className="btn btn-primary btn-export-log"
                onClick={handleExportLog}
              >
                {t({ id: 'IDS_EXPORT_LOG' })}
              </Button>
              <Button ghost type="primary" className="btn" onClick={onCancel}>
                {t({ id: 'IDS_CLOSE' })}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(
  (state) => ({ uploadInfoModal: state.system.uploadInfoModal }),
  { actionGetStudies, actionGetTotalStatus }
)(withRouter(UploadDatasets));
