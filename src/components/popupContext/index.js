import React from 'react';
import { Button } from 'antd';
import './PopupContext.scss';

const PopupContext = ({ visible, x, y, buttonList = [] }) =>
  visible && (
    <ul className="popup-context" style={{ left: `${x}px`, top: `${y}px` }}>
      {buttonList.map((button) => (
        <li key={button.id}>
          <Button
            className="btn-popup"
            disabled={button.isDisable}
            type="link"
            onClick={() => button.action()}
          >
            {button.name}
          </Button>
        </li>
      ))}
    </ul>
  );

export default PopupContext;
