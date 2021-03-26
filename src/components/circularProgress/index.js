import React from 'react';
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { CheckOutlined } from '@ant-design/icons';
import './CircularProgress.scss';

const CircularProgress = ({ percentage }) => {
  return (
    <CircularProgressbarWithChildren
      className="circular-progress-bar"
      value={percentage || 0}
      text={percentage === 100 ? null : `${percentage || 0}%`}
      styles={buildStyles({
        textSize: '16px',
        pathTransitionDuration: 0.5,
        pathColor: `rgba(63, 76, 161, 1)`,
        textColor: '#17b978',
        trailColor: 'rgba(63, 76, 161, 0.1)',
      })}
    >
      {percentage === 100 && <CheckOutlined className="checked-ic" />}
    </CircularProgressbarWithChildren>
  );
};

export default React.memo(CircularProgress);
