import Head from 'next/head';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import uniqBy from 'lodash/uniqBy';

import useRouter from 'utils/router';
import { decodeQueryParams } from 'utils/url';
import { parseGadm36Id } from 'utils/gadm';
import { parseStringWithVars } from 'utils/strings';

import { getLocationData } from 'services/location';
import {
  // getCountriesProvider,
  getRegionsProvider,
  getSubRegionsProvider,
  getCategorisedCountries,
  getCountryLinksSerialized,
} from 'services/country';

import PageLayout from 'wrappers/page';
import Dashboards from 'layouts/dashboards';

import DashboardsUrlProvider from 'providers/dashboards-url-provider';

import { setCountriesSSR } from 'providers/country-data-provider/actions';

import {
  getSentenceData,
  parseSentence,
  handleSSRLocationObjects,
} from 'services/sentences';

import { setGeodescriberSSR } from 'providers/geodescriber-provider/actions';
import { setMapSettings } from 'components/map/actions';
import { setModalMetaSettings } from 'components/modals/meta/actions';
import { setDashboardPrompts } from 'components/prompts/dashboard-prompts/actions';

import {
  setWidgetsSettings,
  setWidgetsCategory,
  setShowMap,
  setActiveWidget,
} from 'components/widgets/actions';

const notFoundProps = {
  error: 404,
  title: 'Dashboard Not Found | Global Forest Watch',
  errorTitle: 'Dashboard Not Found',
};

const ALLOWED_TYPES = ['global', 'country', 'aoi'];

// @todo : check AOI area label
function getLabel(location, countryData) {
  let country;
  if (location.adm0) {
    country = countryData?.countries.find((c) => c.value === location.adm0)
      ?.label;
  }

  if (location.adm2) {
    const adm2Label = countryData?.subRegions.find(
      (c) => c.value === location.adm2
    )?.label;
    return `${adm2Label}, ${country}`;
  }
  if (location.adm1) {
    const adm1Label = countryData?.regions.find(
      (c) => c.value === location.adm1
    )?.label;
    return `${adm1Label}, ${country}`;
  }
  if (location.adm0) {
    return country;
  }
  return 'global';
}

export const getServerSideProps = async ({ params, query, req }) => {
  const [type] = params?.location || [];

  let basePath = null;

  try {
    basePath = new URL(`http:${req?.url}`).pathname;
  } catch (_) {
    // ignore
  }

  if (type && !ALLOWED_TYPES.includes(type)) {
    return {
      props: notFoundProps,
    };
  }

  let countryData = await getCategorisedCountries(true);

  if (!type || type === 'global') {
    // get global data
    const data = await getSentenceData();
    const parsedSentence = parseSentence(data);
    const description = parseStringWithVars(
      parsedSentence.sentence,
      parsedSentence.params
    );
    return {
      props: {
        title: 'Global Deforestation Rates & Statistics by Country | GFW',
        category: query?.category || null,
        basePath,
        location: params?.location,
        globalSentence: parsedSentence,
        geodescriber: JSON.stringify(data),
        countryData: JSON.stringify(countryData),
        description,
      },
    };
  }

  try {
    const locationData = await getLocationData(params?.location);
    const { locationName } = locationData || {};

    if (!locationName) {
      return {
        props: notFoundProps,
      };
    }

    const title = `${locationName} Deforestation Rates & Statistics | GFW`;
    const noIndex = !['country'].includes(type);
    const [locationType, adm0, lvl1, lvl2] = params?.location;
    const adm1 = lvl1 ? parseInt(lvl1, 10) : null;
    const adm2 = lvl2 ? parseInt(lvl2, 10) : null;

    const data = await getSentenceData({
      type: locationType === 'aoi' ? 'country' : locationType,
      adm0,
      adm1,
      adm2,
      threshold: 30,
      extentYear: 2010,
    });

    if (adm0) {
      const regions = await getRegionsProvider({ adm0 });
      const countryLinks = await getCountryLinksSerialized();
      countryData = {
        ...countryData,
        regions: uniqBy(regions.data.rows).map((row) => ({
          id: parseGadm36Id(row.id).adm1,
          value: parseGadm36Id(row.id).adm1,
          label: row.name,
          name: row.name,
        })),
        countryLinks,
      };
    }

    if (adm1) {
      const subRegions = await getSubRegionsProvider(adm0, adm1);
      countryData = {
        ...countryData,
        subRegions: uniqBy(subRegions.data.rows).map((row) => ({
          id: parseGadm36Id(row.id).adm2,
          value: parseGadm36Id(row.id).adm2,
          label: row.name,
          name: row.name,
        })),
      };
    }

    const { locationNames, locationObj } = handleSSRLocationObjects(
      countryData,
      adm0,
      adm1,
      adm2
    );

    const parsedSentence = parseSentence(data, locationNames, locationObj);
    const label = getLabel({ adm0, adm1, adm2 }, countryData);

    const handleSSRLocation = {
      adm0,
      adm1,
      adm2,
      countryData,
      type: locationType,
      category: query?.category || 'summary',
      label: label || null,
    };

    const description = parseStringWithVars(
      parsedSentence.sentence,
      parsedSentence.params
    );

    return {
      props: {
        title,
        description,
        category: query?.category || 'summary',
        basePath,
        globalSentence: parsedSentence,
        handleSSRLocation,
        geodescriber: JSON.stringify(data),
        countryData: JSON.stringify(countryData),
        noIndex,
      },
    };
  } catch (err) {
    if (err?.response?.status === 401) {
      return {
        props: {
          error: 401,
          title: 'Area is private | Global Forest Watch',
          errorTitle: 'Area is private',
        },
      };
    }

    return {
      props: notFoundProps,
    };
  }
};

const DashboardsPage = (props) => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);
  const { query, asPath, isFallback } = useRouter();
  const fullPathname = asPath?.split('?')?.[0];
  const {
    globalSentence,
    handleSSRLocation,
    geodescriber,
    countryData,
  } = props;

  useEffect(() => {
    const {
      map,
      modalMeta,
      dashboardPrompts,
      category,
      areaOfInterestModal,
      showMap,
      widget,
      ...widgets
    } = decodeQueryParams(query) || {};

    if (map) {
      dispatch(setMapSettings(map));
    }

    if (modalMeta) {
      dispatch(setModalMetaSettings(modalMeta));
    }

    if (dashboardPrompts) {
      dispatch(setDashboardPrompts(dashboardPrompts));
    }

    if (widgets) {
      dispatch(setWidgetsSettings(widgets));
    }

    if (category) {
      dispatch(setWidgetsCategory(category));
    }

    if (showMap) {
      dispatch(setShowMap(showMap));
    }

    if (widget) {
      dispatch(setActiveWidget(widget));
    }

    // SSR Specifics
    if (geodescriber) {
      dispatch(setGeodescriberSSR(JSON.parse(geodescriber)));
    }

    if (countryData) {
      dispatch(setCountriesSSR(JSON.parse(countryData)));
    }
  }, [fullPathname, isFallback]);

  // when setting the query params from the URL we need to make sure we don't render the map
  // on the server otherwise the DOM will be out of sync
  useEffect(() => {
    if (!ready) {
      setReady(true);
    }
  });

  return (
    <PageLayout {...props}>
      <Head>
        <link
          rel="canonical"
          href={`https://www.globalforestwatch.org${props?.basePath || ''}${
            props.category ? `?category=${props?.category}` : ''
          }`}
        />
      </Head>
      <DashboardsUrlProvider />
      <Dashboards
        ssrLocation={handleSSRLocation}
        globalSentence={globalSentence}
      />
    </PageLayout>
  );
};

DashboardsPage.propTypes = {
  title: PropTypes.string,
  category: PropTypes.string,
  basePath: PropTypes.string,
  globalSentence: PropTypes.object,
  handleSSRLocation: PropTypes.object,
  geodescriber: PropTypes.string,
  countryData: PropTypes.string,
};

export default DashboardsPage;
