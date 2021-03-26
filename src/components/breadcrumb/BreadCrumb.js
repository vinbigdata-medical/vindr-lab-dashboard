import React from 'react';
import { Breadcrumb } from 'antd';
import './BreadCrumb.scss';

const BreadCrumb = (props) => {
  const { breadcrumbList = [] } = props;
  return (
    <Breadcrumb separator=">" className="breadcrumb-list">
      {breadcrumbList.map((text, idx) => (
        <Breadcrumb.Item className="breadcrumb-item" key={idx}>
          {text || ''}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default React.memo(BreadCrumb);
