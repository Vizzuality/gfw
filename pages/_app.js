/* eslint-disable react/prop-types */
import 'babel-polyfill';
import React, { useMemo } from 'react';
import finallyShim from 'promise.prototype.finally';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import useStore from 'redux/store';

import reducerRegistry from 'redux/registry';
import MyGFWProvider from 'providers/mygfw-provider';
import LocationProvider from 'providers/location-provider';

import 'styles/styles.scss';

finallyShim.shim();

const App = ({ Component, pageProps }) => {
  const store = useStore(pageProps.initialReduxState);

  useMemo(() => {
    store.replaceReducer(combineReducers(reducerRegistry.getReducers()));
  });

  return (
    <Provider store={store}>
      <MyGFWProvider />
      <LocationProvider />
      <Component {...pageProps} />
    </Provider>
  );
};

export default App;
