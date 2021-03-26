import React from 'react';
import moment from 'moment';
import { IntlProvider } from 'react-intl';
import { ConfigProvider } from 'antd';
import { connect } from 'react-redux';
import vi_VN from 'antd/es/locale/vi_VN';
import en_US from 'antd/es/locale/en_US';
import 'moment/locale/vi';
import vi from '../locale/vi.json';
import en from '../locale/en.json';

const Locales = (props) => {
  const localeIntl = {
    locale: props.locale,
    messages: props.locale === 'en' ? en : vi,
  };
  moment.locale(props.locale);
  return (
    <IntlProvider {...localeIntl}>
      <ConfigProvider locale={props.locale === 'en' ? en_US : vi_VN}>
        {props.children}
      </ConfigProvider>
    </IntlProvider>
  );
};

export default connect(
  (state) => ({
    locale: state.system.locale,
  }),
  null
)(Locales);
