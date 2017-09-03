import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

import AboutCover from './components/AboutCover/AboutCover';
import AboutAnchors from './components/AboutAnchors/AboutAnchors';
import AboutUsers from './components/AboutUsers/AboutUsersContainer';
import AboutHow from './components/AboutHow/AboutHow';
import AboutOutcomes from './components/AboutOutcomes/AboutOutcomes';
import AboutAwards from './components/AboutAwards/AboutAwards';
import AboutHistory from './components/AboutHistory/AboutHistory';
import AboutLogos from './components/AboutLogos/AboutLogos';

const preloadedState = {
  globe: {
    userGroup: 'Civil Society',
    isVisible: false
  }
};
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
let store = createStore(
  reducers,
  preloadedState,
  composeEnhancers(
    applyMiddleware(thunk)
  )
);

const About = () => {
  return (
    <Provider store={store}>
      <div>
        <AboutCover title="About" description="Global Forest Watch (GFW) is an online platform that provides data and tools for monitoring forests. By harnessing cutting-edge technology, GFW allows anyone to access near real-time information about where and how forests are changing around the world."/>
        <AboutAnchors />
        <AboutUsers />
        <AboutHow />
        <AboutOutcomes />
        <AboutAwards />
        <AboutHistory />
        <AboutLogos />
      </div>
    </Provider>
  );
};

export default About;
