import cx from 'classnames';

import { Carousel, Row, Column } from 'gfw-components';
import Icon from 'components/ui/icon';

import USE_APPS from './config';

import './styles.scss';

const HomeApps = () => (
  <div className="c-home-apps">
    <h2>BROWSE APPLICATIONS</h2>
    <Carousel
      className="apps-carousel"
      settings={{
        slidesToShow: 1,
        infinite: true,
      }}
    >
      {USE_APPS.map((app) => (
        <a
          key={app.title}
          href={app.extLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div
            className="app-slide"
            style={{
              backgroundColor: app.color,
            }}
          >
            <Row className="apps">
              <Column>
                <div className="app-content">
                  <Icon
                    className={cx('app-icon', app.className)}
                    icon={app.icon}
                  />
                  <h3>{app.title}</h3>
                  <p>{app.description}</p>
                  <div
                    className="app-image"
                    style={{
                      backgroundImage: `url(${app.background})`,
                    }}
                  />
                </div>
              </Column>
            </Row>
          </div>
        </a>
      ))}
    </Carousel>
  </div>
);

export default HomeApps;
