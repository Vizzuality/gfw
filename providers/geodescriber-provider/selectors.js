import { createSelector, createStructuredSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';

import { selectActiveLang } from 'utils/lang';
import { getDataLocation, buildFullLocationName } from 'utils/location';

import { getActiveArea } from 'providers/areas-provider/selectors';

import { parseSentence } from 'services/sentences';

export const selectGeojson = (state) =>
  state.geostore && state.geostore.data && state.geostore.data.geojson;
export const selectGeodescriber = (state) =>
  state.geodescriber && state.geodescriber.data;
export const selectLoading = (state) =>
  state.geodescriber && state.geodescriber.loading;
export const selectCountryData = (state) =>
  state.countryData && {
    adm0: state.countryData.countries,
    adm1: state.countryData.regions,
    adm2: state.countryData.subRegions,
  };

export const getAdm0Data = createSelector(
  [selectCountryData],
  (data) => data && data.adm0
);

export const getAdm1Data = createSelector(
  [selectCountryData],
  (data) => data && data.adm1
);

export const getAdm2Data = createSelector(
  [selectCountryData],
  (data) => data && data.adm2
);

export const getAdminsSelected = createSelector(
  [getAdm0Data, getAdm1Data, getAdm2Data, getDataLocation],
  (adm0s, adm1s, adm2s, location) => {
    const adm0 =
      (adm0s && adm0s.find((i) => i.value === location.adm0)) || null;
    const adm1 =
      (adm1s && adm1s.find((i) => i.value === location.adm1)) || null;
    const adm2 =
      (adm2s && adm2s.find((i) => i.value === location.adm2)) || null;
    let current = adm0;
    if (location.adm2) {
      current = adm2;
    } else if (location.adm1) {
      current = adm1;
    }

    return {
      ...current,
      adm0,
      adm1,
      adm2,
    };
  }
);

export const getAdminLocationName = createSelector(
  [getDataLocation, getAdm0Data, getAdm1Data, getAdm2Data],
  (location, adm0s, adm1s, adm2s) =>
    buildFullLocationName(location, { adm0s, adm1s, adm2s })
);

export const getGeodescriberTitle = createSelector(
  [selectGeodescriber, getDataLocation, getAdminLocationName, getActiveArea],
  (geodescriber, location, adminTitle, activeArea) => {
    if (isEmpty(geodescriber)) return {};

    if (
      (location.type === 'aoi' || location.areaId) &&
      activeArea &&
      activeArea.userArea
    ) {
      return {
        sentence: activeArea.name,
      };
    }

    // if not an admin we can use geodescriber
    if (!['global', 'country'].includes(location.type)) {
      return {
        sentence: geodescriber.title,
        params: geodescriber.title_params,
      };
    }

    // if an admin we need to calculate the params
    return {
      sentence: adminTitle,
    };
  }
);

export const getGeodescriberTitleFull = createSelector(
  [getGeodescriberTitle],
  (title) => {
    if (isEmpty(title)) return null;

    let { sentence } = title;
    if (title.params) {
      Object.keys(title.params).forEach((p) => {
        sentence = sentence.replace(`{${p}}`, title.params[p]);
      });
    }
    return sentence;
  }
);

export const getAdminDescription = createSelector(
  [getAdminsSelected, selectGeodescriber, getDataLocation],
  (locationNames, data, locationObj) =>
    parseSentence(data, locationNames, locationObj)
);

export const getGeodescriberDescription = createSelector(
  [selectGeodescriber, getDataLocation, getAdminDescription],
  (geodescriber, location, adminSentence) => {
    if (isEmpty(geodescriber)) return {};
    // if not an admin we can use geodescriber
    if (!['global', 'country'].includes(location.type)) {
      return {
        sentence: geodescriber.description,
        params: geodescriber.description_params,
      };
    }

    // if an admin we needs to calculate the params
    return adminSentence;
  }
);

export const getGeodescriberProps = createStructuredSelector({
  loading: selectLoading,
  location: getDataLocation,
  geojson: selectGeojson,
  lang: selectActiveLang,
});
