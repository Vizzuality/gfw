import axios from 'axios';

import { getGainGrouped } from 'services/forest-data';

export default ({ params }) => {
  const { adm0, adm1, adm2, ...rest } = params || {};
  const parentLocation = {
    adm0: adm0 && !adm1 ? null : adm0,
    adm1: adm1 && !adm2 ? null : adm1,
    adm2: null
  };
  return axios.all([getGainGrouped({ ...rest, ...parentLocation })]).then(
    axios.spread(gainResponse => {
      let groupKey = 'iso';
      if (adm1) groupKey = 'adm1';
      if (adm2) groupKey = 'adm2';
      const gainData = gainResponse.data.data;
      let mappedData = [];
      if (gainData && gainData.length) {
        mappedData = gainData.map(item => {
          const gain = item.gain || 0;
          const extent = item.extent || 0;
          return {
            id:
              groupKey !== 'iso'
                ? parseInt(item[groupKey], 10)
                : item[groupKey],
            gain,
            extent,
            percentage: extent ? 100 * gain / extent : 0
          };
        });
      }
      return mappedData;
    })
  );
};
