import { createAction, createThunkAction } from 'redux-tools';

import { getNewsProvider } from 'services/news';

export const setNewsLoading = createAction('setNewsLoading');
export const setNews = createAction('setNews');

export const getNews = createThunkAction(
  'getNews',
  () => (dispatch, getState) => {
    const { news } = getState();
    if (news && !news.loading) {
      dispatch(setNewsLoading(true));
      getNewsProvider()
        .then(response => {
          const { data } = response.data;
          if (data && !!data.length) {
            dispatch(setNews(data));
          }
          dispatch(setNewsLoading(false));
        })
        .catch(error => {
          dispatch(setNewsLoading(false));
          console.info(error);
        });
    }
  }
);
