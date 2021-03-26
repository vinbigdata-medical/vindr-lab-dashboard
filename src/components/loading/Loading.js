import React from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import './Loading.scss';

const Loading = (props) => {
  return (
    <div
      className={`loading-wrapper ${props.isLoading ? 'ld-show' : 'ld-hide'} ${
        props.dark ? 'ld-dim-dark' : 'ld-dim-light'
      }`}
    >
      <div className="middle-sreen">
        <Spin size="large" />
      </div>
    </div>
  );
};

export default connect(
  (state) => ({ isLoading: state.system.isLoading }),
  {}
)(Loading);
