import { rwRequest, dataRequest } from 'utils/request';

// Feature env will always be "null" on production
const featureEnv = process.env.NEXT_PUBLIC_FEATURE_ENV;

// https://resource-watch.github.io/doc-api/concepts.html#pagination
export const getDatasets = () =>
  rwRequest
    .get(
      `/dataset?application=gfw&includes=metadata,vocabulary,layer&page[size]=100&env=production${
        featureEnv ? `,${featureEnv},preproduction-staging` : ''
      }${featureEnv === 'staging' ? `&refresh=${new Date()}` : ''}`
    )
    .then((res) => res?.data);

export const getDatasetQuery = ({ dataset, version = 'latest', sql, token }) =>
  dataRequest
    .get(`/dataset/${dataset}/${version}/query?sql=${sql}`, {
      cancelToken: token,
    })
    .then((res) => res?.data);

export const getDatasetGeostore = ({
  dataset,
  version = 'latest',
  geostoreId,
  token,
}) =>
  dataRequest
    .get(`/dataset/${dataset}/${version}/geostore/${geostoreId}`, {
      cancelToken: token,
    })
    .then((res) => res?.data);
