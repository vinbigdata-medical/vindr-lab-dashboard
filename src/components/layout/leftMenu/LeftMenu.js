import React, { useEffect, useState } from 'react';
import { Menu, Layout } from 'antd';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { routes, ROLES } from '../../../utils/constants/config';
import {
  IconMenuProject,
  IconCollapse,
  IconMenuLabel,
} from '../../../assets';
import { checkRole } from '../../../view/system/systemAction';
import './LeftMenu.scss';

const LeftMenu = (props) => {
  const { location, userInfo } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState();

  useEffect(() => {
    const { pathname } = location;
    if (pathname?.indexOf(routes.STUDY_LIST) > -1) {
      setSelectedKeys(routes.PROJECTS);
    } else {
      setSelectedKeys(pathname);
    }
  }, [location]);

  const onCollapse = (isCollapse) => {
    setCollapsed(isCollapse);
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKeys(key);
    props.history.push(key);
  };

  const menuList = [
    {
      icon: <IconMenuProject />,
      text: <FormattedMessage id="IDS_MY_PROJECTS" />,
      route: routes.PROJECTS,
      isShow: true,
    },
    {
      icon: <IconMenuLabel />,
      text: <FormattedMessage id="IDS_LABEL_MANAGEMENT" />,
      route: routes.LABEL_MANAGEMENT,
      isShow:
        checkRole(userInfo, ROLES.PO) || checkRole(userInfo, ROLES.PO_PARTNER),
    },
  ];

  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      className="left-layout-sider"
      trigger={<IconCollapse />}
    >
      <div className="sider-container">
        <div className="left-menu-wrapper">
          <Menu
            onClick={handleMenuClick}
            selectedKeys={[selectedKeys]}
            mode="inline"
            className="menu-list"
          >
            {menuList.map((el) => {
              if (el.isShow) {
                return (
                  <Menu.Item
                    key={el.route}
                    icon={
                      el.icon ? (
                        <span role="img" className="anticon">
                          {el.icon}
                        </span>
                      ) : null
                    }
                  >
                    {el.text}
                  </Menu.Item>
                );
              }
              return null;
            })}
          </Menu>
        </div>
      </div>
    </Layout.Sider>
  );
};

export default connect(
  (state) => ({ userInfo: state.system.profile }),
  null
)(withRouter(LeftMenu));
