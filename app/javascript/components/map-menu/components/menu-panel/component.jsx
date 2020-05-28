import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import startCase from 'lodash/startCase';
import { motion } from 'framer-motion';

import { Media } from 'utils/responsive';

import Loader from 'components/ui/loader';
import Button from 'components/ui/button';
import Icon from 'components/ui/icon';
import closeIcon from 'assets/icons/close.svg?sprite';
import arrowIcon from 'assets/icons/arrow-down.svg?sprite';

import './styles.scss';

class MenuPanel extends PureComponent {
  render() {
    const {
      active,
      className,
      label,
      category,
      large,
      onClose,
      onOpen,
      children,
      loading,
      setMenuSettings,
      collapsed,
    } = this.props;

    return (
      <>
        {active && (
          <Fragment>
            <Media greaterThanOrEqual="md">
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ ease: 'easeInOut', duration: 0.3 }}
                variants={{
                  visible: { opacity: 1, x: 66 },
                  hidden: { opacity: 0, x: 0 },
                }}
                className={cx(
                  'c-menu-panel',
                  'map-tour-menu-panel',
                  { large },
                  className
                )}
              >
                <button className="close-menu" onClick={onClose}>
                  <Icon icon={closeIcon} className="icon-close-panel" />
                </button>
                {!loading && <div className="panel-body">{children}</div>}
                {loading && <Loader className="map-menu-loader" />}
              </motion.div>
            </Media>
            <Media
              lessThan="md"
              className={cx(
                'c-menu-panel',
                'map-tour-menu-panel',
                { large },
                className
              )}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ ease: 'easeInOut', duration: 0.3 }}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 50 },
                }}
              >
                <div className="panel-header">
                  <div className="panel-label">
                    {category ? (
                      <button
                        onClick={() => setMenuSettings({ datasetCategory: '' })}
                      >
                        <Icon icon={arrowIcon} className="icon-return" />
                        <span>{startCase(category)}</span>
                      </button>
                    ) : (
                      <span>{label}</span>
                    )}
                  </div>
                  <Button
                    className="panel-close"
                    theme="theme-button-clear"
                    onClick={collapsed ? onOpen : onClose}
                  >
                    <Icon
                      icon={arrowIcon}
                      className={cx('icon-close-panel', { collapsed })}
                    />
                  </Button>
                </div>
                {!loading && <div className="panel-body">{children}</div>}
                {loading && <Loader className="map-menu-loader" />}
              </motion.div>
            </Media>
          </Fragment>
        )}
      </>
    );
  }
}

MenuPanel.propTypes = {
  children: PropTypes.node,
  large: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
  setMenuSettings: PropTypes.func,
  label: PropTypes.string,
  category: PropTypes.string,
  active: PropTypes.bool,
  loading: PropTypes.bool,
  collapsed: PropTypes.bool,
  onOpen: PropTypes.func,
};

export default MenuPanel;
