import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { initGA, handlePageTrack } from 'analytics';
import { checkBrowser } from 'utils/browser';
import { MediaContextProvider } from 'utils/responsive';

import { Footer } from 'gfw-components';
import { setModalContactUsOpen } from 'components/modals/contact-us/actions';

import Header from 'components/header';
import Cookies from 'components/cookies';
import ContactUsModal from 'components/modals/contact-us';
import NavLink from 'components/nav-link';
import ClimateModal from 'components/modals/climate';
import FiresModal from 'components/modals/fires';

import Head from 'layouts/head';

import 'styles/styles.scss';
import './styles.scss';

class App extends PureComponent {
  static propTypes = {
    loggedIn: PropTypes.bool,
    children: PropTypes.node,
    router: PropTypes.object,
    fullScreen: PropTypes.bool,
    showHeader: PropTypes.bool,
    showFooter: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    noIndex: PropTypes.bool,
    embed: PropTypes.bool,
  };

  static defaultProps = {
    showHeader: true,
    showFooter: true,
  };

  componentDidMount() {
    const { router } = this.props;

    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    handlePageTrack();

    const isValidBrowser = checkBrowser();
    if (!isValidBrowser) {
      router.push('/browser-support');
    }
  }

  render() {
    const {
      loggedIn,
      children,
      fullScreen,
      showHeader,
      showFooter,
      title,
      description,
      keywords,
      noIndex,
    } = this.props;

    return (
      <>
        <Head
          title={title}
          description={description}
          keywords={keywords}
          noIndex={noIndex}
        />
        <MediaContextProvider>
          <div className={cx('l-root', { '-full-screen': fullScreen })}>
            {showHeader && (
              <Header
                loggedIn={loggedIn}
                fullScreen={fullScreen}
                NavLinkComponent={({
                  children: headerChildren,
                  className,
                  ...props
                }) => (
                  <NavLink {...props}>
                    <a className={className}>{headerChildren}</a>
                  </NavLink>
                )}
              />
            )}
            <div className="page">{children}</div>
            <FiresModal />
            <ClimateModal />
            <ContactUsModal />
            {showFooter && (
              <Footer openContactUsModal={() => setModalContactUsOpen(true)} />
            )}
            <Cookies />
          </div>
        </MediaContextProvider>
      </>
    );
  }
}

export default App;
