import { all, spread } from 'axios';
import { getExtentOld, getLossOld } from 'services/forest-data';

export default ({ params }) =>
  all([
    getLossOld({ ...params, landCategory: 'tsc' }),
    getExtentOld({ ...params })
  ]).then(
    spread((loss, extent) => {
      let data = {};
      if (loss && loss.data && extent && extent.data) {
        data = {
          loss: loss.data.data,
          extent: (loss.data.data && extent.data.data[0].value) || 0
        };
      }
      return data;
    })
  );
