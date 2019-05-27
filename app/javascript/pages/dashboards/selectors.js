import { createSelector, createStructuredSelector } from 'reselect';
import replace from 'lodash/replace';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import sortBy from 'lodash/sortBy';

import { parseWidgetsWithOptions } from 'components/widgets/selectors';

import CATEGORIES from 'data/categories.json';

// get list data
const selectShowMap = state =>
  state.location && state.location.query && !!state.location.query.showMap;
const selectLocation = state => state.location;
const selectCategory = state =>
  (state.location && state.location.query && state.location.query.category) ||
  'summary';
export const selectQuery = state => state.location && state.location.query;

export const getEmbed = createSelector(
  [selectLocation],
  location => location && location.routesMap[location.type].embed
);

export const getLinks = createSelector([selectCategory], activeCategory =>
  CATEGORIES.map(category => ({
    label: category.label,
    category: category.value,
    active: activeCategory === category.value
  }))
);

export const getWidgetAnchor = () => {
  const widgetHash =
    window.location.hash && replace(window.location.hash, '#', '');
  return document.getElementById(widgetHash);
};

export const getNoWidgetsMessage = createSelector(
  [selectCategory],
  category => `${upperFirst(category)} data for {location} coming soon`
);

export const getWidgets = createSelector(
  [parseWidgetsWithOptions, selectCategory, getEmbed, selectQuery],
  (widgets, category, embed, query) => {
    if (!widgets) return null;
    if (embed) return widgets.filter(w => query && w.widget === query.widget);
    return sortBy(
      widgets.filter(
        w =>
          w.config.categories.includes(category) && !w.config.hideFromDashboard
      ),
      `config.sortOrder[${camelCase(category)}]`
    );
  }
);

export const getActiveWidget = createSelector(
  [getWidgets, selectQuery],
  (widgets, query) => {
    if (!widgets || !widgets.length) return null;
    if (query && query.widget) {
      return widgets.find(w => w.widget === query.widget);
    }
    return widgets[0];
  }
);

export const getActiveWidgetSlug = createSelector([getActiveWidget], widget => {
  if (!widget) return null;
  return widget.widget;
});

export const getDashboardsProps = createStructuredSelector({
  showMapMobile: selectShowMap,
  category: selectCategory,
  links: getLinks,
  widgets: getWidgets,
  activeWidget: getActiveWidget,
  activeWidgetSlug: getActiveWidgetSlug,
  widgetAnchor: getWidgetAnchor,
  noWidgetsMessage: getNoWidgetsMessage
});
