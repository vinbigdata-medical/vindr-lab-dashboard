import React, { useEffect } from 'react';
import { Menu, Dropdown, Layout, Modal, Avatar, Radio } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import cookie from 'js-cookie';
import { withRouter } from 'react-router-dom';
import {
  routes,
  TOKEN,
  REFRESH_TOKEN,
  USER_ROLES,
  VINLAB_VIEW_MODE,
} from '../../../utils/constants/config';
import { isEmpty } from '../../../utils/helpers';
import { vindr_lab_logo_white } from '../../../assets';
import {
  actionLogout,
  requestLogin,
  hasRolePO,
  actionChangeViewMode,
} from '../../../view/system/systemAction';
import './Header.scss';

const Header = (props) => {
  const { formatMessage: t } = useIntl();
  const {
    currentProject = {},
    location = {},
    account,
    viewMode,
    actionChangeViewMode,
  } = props;
  const { pathname = '' } = location;
  const isShowProjectName = pathname.indexOf(routes.STUDY_LIST) !== -1;

  useEffect(() => {
    if (!isEmpty(account)) {
      const previousViewMode = localStorage.getItem(VINLAB_VIEW_MODE);
      actionChangeViewMode(
        previousViewMode === USER_ROLES.PROJECT_OWNER ||
          (!previousViewMode && hasRolePO(account))
          ? USER_ROLES.PROJECT_OWNER
          : USER_ROLES.ANNOTATOR
      );
    }
    // eslint-disable-next-line
  }, [account]);

  const handleClickAvatar = async (item) => {
    if (item.key === routes.LOGOUT) {
      Modal.confirm({
        title: 'Are you sure?',
        content: null,
        onOk: () => {
          if (cookie.get(REFRESH_TOKEN)) {
            actionLogout();
          } else {
            cookie.remove(TOKEN);
            cookie.remove(REFRESH_TOKEN);
            requestLogin();
          }
        },
        onCancel: () => {},
      });
    }
  };

  const goHomePage = () => {
    props.history.push(routes.PROJECTS);
  };

  const handleSwitchViewMode = (event) => {
    actionChangeViewMode(event?.target?.value);
  };

  const menu = (
    <Menu onClick={handleClickAvatar}>
      <Menu.Item key={routes.LOGOUT}>
        <FormattedMessage id="IDS_COMMON_LOGOUT" />
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout.Header>
      <div className="header-container">
        <div className="header-left-content">
          <span role="img" className="anticon app-logo" onClick={goHomePage}>
            <img className="img-logo" alt="" src={vindr_lab_logo_white}/>
          </span>
        </div>
        {isShowProjectName && currentProject?.name && (
          <div className="project-name">{currentProject?.name}</div>
        )}
        <div className="header-right-content">
          <div className="switch-view-mode">
            <Radio.Group
              buttonStyle="solid"
              size="small"
              value={viewMode}
              onChange={handleSwitchViewMode}
            >
              <Radio.Button value={USER_ROLES.ANNOTATOR}>
                {t({ id: 'IDS_LABELER' })}
              </Radio.Button>
              <Radio.Button value={USER_ROLES.PROJECT_OWNER}>
                {t({ id: 'IDS_MANAGER' })}
              </Radio.Button>
            </Radio.Group>
          </div>
          <Dropdown overlay={menu}>
            <div className="user-info">
              <span className="user-name">{account?.preferred_username}</span>
              <Avatar size={30} icon={<UserOutlined />} />
            </div>
          </Dropdown>
        </div>
      </div>
    </Layout.Header>
  );
};

export default connect(
  (state) => ({
    account: state.system.profile,
    viewMode: state.system.viewMode,
    currentProject: state.project.currentProject,
  }),
  { actionChangeViewMode }
)(withRouter(Header));
