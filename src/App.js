import React, { useEffect } from 'react';
import { Layout, message } from 'antd';
import cookie from 'js-cookie';
import { connect } from 'react-redux';
import Routes from './Routes';
import { LeftMenu, Header } from './components/layout';
import Loading from './components/loading/Loading';
import {
  getAccountInfo,
  actionGetToken,
  actionGetPermissionToken,
  actionShowLoading,
  requestLogin,
  actionShowUploadModal,
  actionLogout,
  actionGetListPermission,
} from './view/system/systemAction';
import {
  TOKEN,
  REFRESH_TOKEN,
  FIRST_REFRESH_TOKEN,
} from './utils/constants/config';
import ImportDataModal from './components/uploadDatasets/ImportDataModal';
import './App.scss';

const App = (props) => {
  const { uploadInfoModal = {} } = props;

  useEffect(() => {
    if (cookie.get(TOKEN) || cookie.get(REFRESH_TOKEN)) {
      props.getAccountInfo();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!cookie.get(TOKEN) && !cookie.get(REFRESH_TOKEN)) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      if (code) {
        getToken(code);
      } else if (!error) {
        requestLogin();
      } else {
        const error_description = urlParams.get('error_description');
        error_description && message.error(error_description || '');
      }
    }
    // eslint-disable-next-line
  });

  const getToken = async (code) => {
    try {
      props.actionShowLoading();
      console.log('GET TOKEN');
      const res = await actionGetToken(code);
      const resPermission = await actionGetListPermission(
        res?.data?.access_token
      );
      cookie.set(FIRST_REFRESH_TOKEN, res?.data?.refresh_token, {
        expires: new Date(
          (res?.data?.refresh_expires_in || 1800) * 1000 + Date.now()
        ),
      });
      const { data } = await actionGetPermissionToken(
        res?.data?.access_token,
        resPermission?.data?.data
      );

      cookie.set(TOKEN, data?.access_token, {
        expires: new Date((data?.expires_in || 1800) * 1000 + Date.now()),
      });
      cookie.set(REFRESH_TOKEN, data?.refresh_token, {
        expires: new Date(
          (data?.refresh_expires_in || 1800) * 1000 + Date.now()
        ),
      });

      cookie.remove(FIRST_REFRESH_TOKEN);
      props.getAccountInfo();
    } catch (error) {
      console.log(error);
      setTimeout(() => {
        actionLogout();
      }, 1000);
      message.error('System error!');
    }
  };

  if (!cookie.get(TOKEN) && !cookie.get(REFRESH_TOKEN)) {
    return <Loading dark />;
  }

  return (
    <div className="app-container">
      <Loading dark />
      <Layout>
        <Header />
        <Layout>
          <LeftMenu />
          <Layout.Content className="content-container">
            <Routes />
          </Layout.Content>
        </Layout>
      </Layout>
      {uploadInfoModal.isShow && (
        <ImportDataModal
          projectId={uploadInfoModal.projectId}
          onCancel={() => {
            props.actionShowUploadModal({
              isShow: false,
              projectId: '',
              studyParams: {},
            });
          }}
        />
      )}
    </div>
  );
};

export default connect(
  (state) => ({
    uploadInfoModal: state.system.uploadInfoModal,
  }),
  { getAccountInfo, actionShowLoading, actionShowUploadModal }
)(App);
