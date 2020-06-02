import Router from 'next/router';
import qs from 'query-string';

import { decodeUrlForState, encodeStateForUrl } from './stateToUrl';

export default () => {
  const { router } = Router;
  if (router) {
    if (router?.asPath.includes('?')) {
      router.query = {
        ...router.query,
        ...qs.parse(router.asPath.split('?')[1]),
      };
    }

    router.query = decodeUrlForState(router.query)

    router.pushDynamic = ({ pathname, query, hash }) => {
      let asPath = pathname;
      if (query) {
        Object.keys(query).forEach((key) => {
          if (asPath.includes(`[${key}]`)) {
            asPath = asPath.replace(`[${key}]`, query[key]);
            delete query[key];
          } else if (asPath.includes(`[...${key}]`)) {
            asPath = asPath.replace(`[...${key}]`, query[key]);
            delete query[key];
          }
        });
      }
      const queryString = encodeStateForUrl(query);
      router.push(
        `${pathname}${queryString ? `?${queryString}` : ''}${hash || ''}`,
        `${asPath}${queryString ? `?${queryString}` : ''}${hash || ''}`
      );
    };
  }

  return { ...Router, ...router };
};