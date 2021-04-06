import PropTypes from 'prop-types';
import Link from 'next/link';

import { Desktop, Mobile, Carousel, Button, Row, Column } from 'gfw-components';

import SimpleCard from 'components/ui/simple-card';
import NoContent from 'components/ui/no-content';

import newsImage from './images/news-bg.jpg';

import './styles.scss';

const HomeNews = ({ articles }) => {
  const renderArticles = () =>
    articles?.map((item) => (
      <a
        key={item.name}
        className="news-card"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <SimpleCard
          className="news-card"
          title={item.name}
          description={item.description}
        />
      </a>
    ));

  return (
    <div
      className="c-home-news"
      style={{
        backgroundImage: `url(${newsImage})`,
      }}
    >
      <Row>
        <Column>
          <h2 className="news-title">New on Global Forest Watch</h2>
          <div className="news-carousel">
            {articles ? (
              <>
                <Desktop>
                  <Carousel
                    settings={{
                      slidesToShow: 3,
                    }}
                  >
                    {renderArticles()}
                  </Carousel>
                </Desktop>
                <Mobile>
                  <Carousel
                    settings={{
                      slidesToShow: 1,
                    }}
                  >
                    {renderArticles()}
                  </Carousel>
                </Mobile>
              </>
            ) : (
              <NoContent className="no-news" message="No news available" />
            )}
          </div>
          <Link href="/my-gfw">
            <a>
              <Button className="my-gfw-btn" light>
                My GFW
              </Button>
            </a>
          </Link>
        </Column>
      </Row>
    </div>
  );
};

HomeNews.propTypes = {
  articles: PropTypes.array,
};

export default HomeNews;
