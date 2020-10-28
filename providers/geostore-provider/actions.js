import { createAction, createThunkAction } from 'redux/actions';
import { getGeostoreProvider, getGeostoreKey } from 'services/geostore';
import { buildGeostore } from 'utils/geoms';

export const setGeostoreLoading = createAction('setGeostoreLoading');
export const setGeostore = createAction('setGeostore');
export const clearGeostore = createAction('clearGeostore');

export const getGeostore = createThunkAction(
  'getGeostore',
  (params) => (dispatch) => {
    const { type, adm0, adm1, adm2, token } = params;
    if (type && adm0) {
      dispatch(setGeostoreLoading({ loading: true, error: false }));
      getGeostoreProvider({ type, adm0, adm1, adm2, token })
        .then((response) => {
          const { data } = response.data;
          if (data && data.attributes) {
            const geostore = buildGeostore(
              { id: data.id, ...data.attributes },
              params
            );
            dispatch(setGeostore(geostore));
          }
        })
        .catch(() => {
          dispatch(setGeostoreLoading({ loading: false, error: true }));
        });
    }
  }
);

export const getGeostoreId = createThunkAction(
  'getGeostoreId',
  ({ geojson, callback }) => (dispatch) => {
    if (geojson) {
      dispatch(setGeostoreLoading({ loading: true, error: false }));
      getGeostoreKey(geojson)
        .then((geostore) => {
          if (geostore && geostore.data && geostore.data.data) {
            const { id } = geostore.data.data;
            if (callback) {
              callback(id);
            } else {
              dispatch(setGeostoreLoading({ loading: false, error: false }));
            }
          }
        })
        .catch(() => {
          setGeostoreLoading({
            loading: false,
            error: true,
          });
        });
    }
  }
);
