import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import useRouter from 'utils/router';

import { setMapSettings } from 'components/map/actions';
import { setModalMetaSettings } from 'components/modals/meta/actions';
import { setDashboardPrompts } from 'components/prompts/dashboard-prompts/actions';
import {
  setWidgetsSettings,
  setWidgetsCategory,
  setShowMap,
  setActiveWidget,
} from 'components/widgets/actions';
import { setAreaOfInterestModalSettings } from 'components/modals/area-of-interest/actions';

import { getLocationData } from 'services/location';

import { decodeParamsForState } from 'utils/stateToUrl';

import Layout from 'layouts/page';
import Dashboards from 'pages/dashboards';
import ConfirmationMessage from 'components/confirmation-message';
import DashboardsUrlProvider from 'providers/dashboards-url-provider';

import './styles.scss';

export const getServerSideProps = async (ctx) => {
  const isGlobal = ctx?.params?.location?.[0] === 'global';
  let locationData = {};

  try {
    locationData =
      (!isGlobal && (await getLocationData(ctx?.params?.location))) || {};
  } catch (err) {
    locationData = {};
  }

  const locationName = isGlobal ? 'Global' : locationData.locationName;

  return {
    props: locationName
      ? {
          title: `${
            locationName || 'Global'
          } Deforestation Rates & Statistics by Country | GFW`,
          description:
            ctx?.params?.location?.length > 1
              ? 'Explore interactive global tree cover loss charts by country. Analyze global forest data and trends, including land use change, deforestation rates and forest fires.'
              : `Explore interactive tree cover loss data charts and analyze ${locationName} forest trends, including land use change, deforestation rates and forest fires.`,
          keywords: `${locationName}, deforestation rates, statistics, interactive, data, forest trends, land use, forest cover by country, global tree cover loss`,
        }
      : {
          title: 'Dashboard not found',
        },
  };
};

const DashboardsPage = (props) => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);
  const { query, asPath } = useRouter();
  const fullPathname = asPath?.split('?')?.[0];

  useMemo(() => {
    const {
      map,
      modalMeta,
      dashboardPrompts,
      category,
      areaOfInterestModal,
      showMap,
      widget,
      ...widgets
    } = decodeParamsForState(query) || {};

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

    if (areaOfInterestModal) {
      dispatch(setAreaOfInterestModalSettings(areaOfInterestModal));
    }

    if (showMap) {
      dispatch(setShowMap(showMap));
    }

    if (widget) {
      dispatch(setActiveWidget(widget));
    }
  }, [fullPathname]);

  // when setting the query params from the URL we need to make sure we don't render the map
  // on the server otherwise the DOM will be out of sync
  useEffect(() => {
    if (!ready) {
      setReady(true);
    }
  });

  const hasDashboard = props?.title !== 'Dashboard not found';

  return (
    <Layout {...props} className="l-dashboards-page">
      {!hasDashboard && (
        <div className="no-dashboard-message">
          <ConfirmationMessage title="Dashboard not found" error large />
        </div>
      )}
      {hasDashboard && ready && (
        <>
          <Dashboards />
          <DashboardsUrlProvider />
        </>
      )}
    </Layout>
  );
};

DashboardsPage.propTypes = {
  title: PropTypes.string,
};

export default DashboardsPage;
