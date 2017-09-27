import { createAction } from 'redux-actions';

const setMapZoom = createAction('setMapZoom');
const setLayer = createAction('setLayer');
const addLayer = createAction('addLayer');

export default {
  setMapZoom,
  setLayer,
  addLayer
};
