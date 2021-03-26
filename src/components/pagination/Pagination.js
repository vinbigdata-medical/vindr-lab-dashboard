import React from 'react';
import { Pagination, Select } from 'antd';
import './PaginationTable.scss';

const pageSizeOptions = [10, 25, 50, 100];

const PaginationTable = (props) => {
  return (
    <div className="pagination-table">
      <span>Row:</span>
      <Select
        defaultValue={props?.defaultPageSize || 25}
        className="page-size-option"
        onChange={props?.onChangePageSize}
      >
        {pageSizeOptions.map((item) => (
          <Select.Option key={item} value={item}>
            <span className="page-size">{item}</span>
          </Select.Option>
        ))}
      </Select>
      <Pagination
        showLessItems={true}
        current={props.page + 1}
        pageSize={props.size}
        total={props.totalElements || 0}
        showSizeChanger={false}
        onChange={props.onChange}
        disabled={props.isDisabled}
        size="small"
      />
    </div>
  );
};

export default PaginationTable;
