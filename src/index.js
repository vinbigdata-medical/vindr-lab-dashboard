import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './configStore';
import LocaleProvider from './utils/localeProvider/LocaleProvider';
import { BASE_ROUTER_PREFIX } from './utils/constants/config';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

window.BUILD_INFO = process.env.BUILD_TIME + '-' + process.env.BUILD_USERNAME;

ReactDOM.render(
  <React.Fragment>
    <Provider store={store}>
      <LocaleProvider>
        <BrowserRouter basename={BASE_ROUTER_PREFIX}>
          <App />
        </BrowserRouter>
      </LocaleProvider>
    </Provider>
  </React.Fragment>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
