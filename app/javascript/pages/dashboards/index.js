import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { handleActionTrack } from 'utils/analytics';

import 'react-tippy/dist/tippy.css';
import 'styles/styles.scss';
import 'babel-polyfill';

import reducers from './reducers';
import router, { EMBED } from './router';

import Page from './page';
import Embed from './embed';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middlewares = applyMiddleware(
  thunk,
  router.middleware,
  handleActionTrack
);
const store = createStore(
  reducers,
  composeEnhancers(router.enhancer, middlewares)
);
const state = store.getState();

const Dashboards = () => (
  <Provider store={store}>
    {state.location.type === EMBED ? <Embed /> : <Page />}
  </Provider>
);

export default Dashboards;
