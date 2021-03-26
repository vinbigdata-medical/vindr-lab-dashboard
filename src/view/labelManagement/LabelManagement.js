import React from 'react';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { USER_ROLES } from '../../utils/constants/config';
import { hasRolePO } from '../system/systemAction';
import LabelGroups from '../../components/labels/LabelGroups';
import Labels from '../../components/labels/Labels';
import './LabelManagement.scss';

const LabelManagement = (props) => {
  const { userInfo, viewMode } = props;
  const { formatMessage: t } = useIntl();

  const isViewAsPO = viewMode === USER_ROLES.PROJECT_OWNER;

  if (!hasRolePO(userInfo) || !isViewAsPO) return null;

  return (
    <div className="common-style-page label-management-page">
      <div className="top-content">
        <div className="page-header">
          <div className="title">{t({ id: 'IDS_LABEL_MANAGEMENT' })}</div>
        </div>
      </div>
      <Row className="page-content">
        <Col className="col-label-groups" xs={24} md={24} lg={6} xl={4}>
          <LabelGroups />
        </Col>
        <Col className="col-labels" xs={24} md={24} lg={18} xl={20}>
          <Labels />
        </Col>
      </Row>
    </div>
  );
};

export default connect(
  (state) => ({
    userInfo: state.system.profile,
    viewMode: state.system.viewMode,
    selectedLabelGroup: state.label.selectedLabelGroup,
  }),
  null
)(LabelManagement);
