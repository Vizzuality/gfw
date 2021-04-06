import PropTypes from 'prop-types';

import HomeCover from './cover';
import HomeSummary from './summary';
import HomeUses from './uses';
import HomeApps from './apps';
import HomeNews from './news';

import './styles.scss';

const HomePage = ({ news }) => {
  return (
    <div className="l-home-page">
      <HomeCover />
      <HomeSummary />
      <HomeUses />
      <HomeApps />
      <HomeNews articles={news} />
    </div>
  );
};

HomePage.propTypes = {
  news: PropTypes.array.isRequired,
};

export default HomePage;
