import { createSelector, createStructuredSelector } from 'reselect';
import { deburrUpper } from 'utils/data';
import { buildGadm36Id } from 'utils/format';
import sortBy from 'lodash/sortBy';
import { translateText } from 'utils/transifex';

import { getActiveDatasetsFromState } from 'components/map/selectors';
import { selectActiveLang } from 'utils/lang';

const selectSearch = (state) => state.mapMenu?.search;
const selectLocation = (state) => state.location;
const selectDatasets = (state) => state.datasets?.data;
const selectLocations = (state) => state.mapMenu?.locations;
const selectLoading = (state) => state.mapMenu?.loading;

const getDatasetWithUrlState = createSelector(
  [getActiveDatasetsFromState, selectDatasets, selectActiveLang],
  (datasetsState, datasets, lang) => {
    const datasetIds = datasetsState.map((d) => d.dataset);

    return (
      datasets &&
      sortBy(
        datasets.map((d) => ({
          ...d,
          active: datasetIds.includes(d.id),
          localeName: lang === 'en' ? d.name : translateText(d.name),
        })),
        ['name', 'localName']
      )
    );
  }
);

const getFilteredDatasets = createSelector(
  [getDatasetWithUrlState, selectSearch, selectActiveLang],
  (datasets, search) =>
    search && datasets
      ? datasets.filter(
          (d) =>
            deburrUpper(d.name).includes(deburrUpper(search)) ||
            deburrUpper(d.localeName).includes(deburrUpper(search)) ||
            deburrUpper(d.description).includes(deburrUpper(search))
        )
      : null
);

const getLocations = createSelector(
  [selectLocations, selectLocation],
  (locations, location) => {
    if (!locations) return null;
    const { adm0, adm1, adm2 } = location;
    const gadmId = buildGadm36Id(adm0, adm1, adm2);

    return locations
      .map((l) => ({
        ...l,
        active: Object.values(l).includes(gadmId),
      }))
      .slice(0, 15);
  }
);

export default createStructuredSelector({
  datasets: getFilteredDatasets,
  search: selectSearch,
  locations: getLocations,
  loading: selectLoading,
  lang: selectActiveLang,
});
