import request from 'utils/request';

import { TRASE_API } from 'utils/apis';

export const fetchTraseContexts = () => request.get(`${TRASE_API}/contexts`);

export const fetchTraseLocationData = (
  contextId,
  columnId,
  startYear,
  endYear
) =>
  request.get(
    `${TRASE_API}/contexts/${contextId}/top_nodes?column_id=${columnId}${
      startYear ? `&start_year=${startYear}` : ''
    }${endYear ? `&end_year=${endYear}` : ''}`
  );
