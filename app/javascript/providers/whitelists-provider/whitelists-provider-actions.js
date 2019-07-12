import { createAction, createThunkAction } from 'redux-tools';

import { getLocationPolynameWhitelist } from 'services/forest-data';

export const setWhitelistLoading = createAction('setWhitelistLoading');

export const setWhitelist = createAction('setWhitelist');

export const getWhitelist = createThunkAction(
  'getWhitelist',
  ({ adm0, adm1, adm2 }) => (dispatch, getState) => {
    const { whitelists } = getState();
    if (whitelists && !whitelists.loading) {
      dispatch(setWhitelistLoading(true));
      getLocationPolynameWhitelist({ adm0, adm1, adm2 })
        .then(response => {
          const { rows } = (response && response.data) || {};
          const whitelistObject = rows && rows[0];
          const whitelist = whitelistObject
            ? Object.keys(whitelistObject).reduce(
              (arr, item) =>
                (whitelistObject[item] > 0 ? arr.concat(item) : arr),
              []
            )
            : [];
          dispatch(setWhitelist(whitelist));
        })
        .catch(error => {
          dispatch(setWhitelistLoading(false));
          console.info(error);
        });
    }
  }
);
