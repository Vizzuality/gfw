import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import cx from 'classnames';
import Widgets from 'components/widgets';
import CountryDataProvider from 'providers/country-data-provider';
import WhitelistsProvider from 'providers/whitelists-provider';
import Share from 'components/modals/share';
import ModalMeta from 'components/modals/meta';

import './embed-styles.scss';
import './trase-embed-styles.scss';

class Embed extends PureComponent {
  render() {
    const { isTrase, widgets } = this.props;
    return (
      <div className={cx('c-embed', { '-trase': isTrase })}>
        <div className="widget-wrapper">
          <Widgets widgets={widgets} embed />
        </div>
        <Share />
        <ModalMeta />
        <CountryDataProvider />
        <WhitelistsProvider />
      </div>
    );
  }
}

Embed.propTypes = {
  isTrase: PropTypes.bool,
  widgets: PropTypes.array
};

export default Embed;
