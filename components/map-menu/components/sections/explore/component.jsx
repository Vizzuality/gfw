import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { trackEvent } from 'utils/analytics';
import ReactHtmlParser from 'react-html-parser';

import { Row, Column } from 'gfw-components';

import SubnavMenu from 'components/subnav-menu';
import Dropdown from 'components/ui/dropdown';
import Card from 'components/ui/card';
import Loader from 'components/ui/loader';
import PTWProvider from 'providers/ptw-provider';

import './styles.scss';

class Explore extends PureComponent {
  render() {
    const {
      section,
      data,
      setMenuSettings,
      handleViewOnMap,
      description,
      mapState,
      loading,
      ptwType,
      setMapPromptsSettings,
    } = this.props;
    const links = [
      {
        label: 'Forest Topics',
        active: section === 'topics',
        onClick: () => {
          setMenuSettings({ exploreType: 'topics' });
          trackEvent({
            category: 'Map menu',
            action: 'Select explore category',
            label: 'Topics',
          });
        },
      },
      {
        label: 'Places to Watch',
        active: section === 'placesToWatch',
        onClick: () => {
          setMenuSettings({ exploreType: 'placesToWatch' });
          trackEvent({
            category: 'Map menu',
            action: 'Select explore category',
            label: 'Places to watch',
          });
        },
      },
      {
        label: 'Stories',
        active: section === 'stories',
        onClick: () => {
          setMenuSettings({ exploreType: 'stories' });
          trackEvent({
            category: 'Map menu',
            action: 'Select explore category',
            label: 'Stories',
          });
        },
      },
    ];

    return (
      <div className="c-explore">
        <SubnavMenu
          links={links}
          className="explore-menu"
          theme="theme-subnav-small-light"
        />
        <div className="content">
          <Row>
            <Column>
              <div className="description">
                {section === 'placesToWatch' ? (
                  <Fragment>
                    <p>{ReactHtmlParser(description)}</p>
                    <p className="ptw-type-intro">Showing information about</p>
                    <Dropdown
                      className="ptw-type-selector"
                      theme="theme-dropdown-native-button"
                      value={ptwType}
                      options={[
                        {
                          label: 'All Places to Watch',
                          value: 'all',
                        },
                        {
                          label: 'Mongabay reporting',
                          value: 'mongabay',
                        },
                        {
                          label: 'Soy',
                          value: 'soy',
                        },
                        {
                          label: 'Oil palm',
                          value: 'palm',
                        },
                      ]}
                      onChange={(value) => setMenuSettings({ ptwType: value })}
                      native
                    />
                    <PTWProvider />
                  </Fragment>
                ) : (
                  <p>{description}</p>
                )}
              </div>
            </Column>
            {!loading &&
              data &&
              data.map((item) => (
                <Column
                  key={item.slug || item.id}
                  width={[1, 1 / 2]}
                  className="map-card"
                >
                  <Card
                    theme="theme-card-small"
                    clamp={5}
                    data={{
                      ...item,
                      buttons: item.buttons.map((b) => ({
                        ...b,
                        ...(b.text === 'VIEW ON MAP' && {
                          onClick: () => {
                            handleViewOnMap({ ...item.payload });
                            setMapPromptsSettings({
                              open: true,
                              stepIndex: 0,
                              stepsKey: `topics${item.title}`,
                            });
                            trackEvent({
                              category: 'Map data',
                              action: 'User loads a topic',
                              label: item.title,
                            });
                          },
                        }),
                      })),
                    }}
                    active={isEqual(item.payload.map, mapState)}
                  />
                </Column>
              ))}
            {loading && <Loader />}
          </Row>
        </div>
      </div>
    );
  }
}

Explore.propTypes = {
  section: PropTypes.string,
  data: PropTypes.array,
  setMenuSettings: PropTypes.func,
  description: PropTypes.string,
  mapState: PropTypes.object,
  loading: PropTypes.bool,
  handleViewOnMap: PropTypes.func,
  ptwType: PropTypes.string,
  setMapPromptsSettings: PropTypes.func,
};

export default Explore;
