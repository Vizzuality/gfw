import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import { setModalFiresOpen, setContactUsOpen } from './actions';

import Modal from '../modal';

import './styles.scss';

class ModalGFWFires extends PureComponent {
  render() {
    const { open, location } = this.props;
    const { query, pathname } = location || {};

    let modalText = '';
    if (pathname) {
      if (pathname === '/topics/[topic]' && query.topic === 'fires') {
        modalText = [
          'Welcome to the new home for Global Forest Watch Fires data and insights! ',
          <button
            key="button"
            onClick={() => {
              setContactUsOpen();
            }}
          >
            Contact us
          </button>,
          " if you don't find what you're looking for.",
        ];
      } else if (pathname === '/map/[...location]') {
        modalText = [
          `Welcome to the new home for Global Forest Watch Fires data and insights!
          If you're looking for the Fire Report, `,
          <Link
            key="link"
            href="/dashboards/[...location]"
            as="/dashboards/global?category=fires"
          >
            <button
              onClick={() => {
                setModalFiresOpen(false);
              }}
            >
              <a>click here</a>
            </button>
          </Link>,
          '.',
        ];
      } else if (
        pathname.includes('dashboards') &&
        query &&
        query.topic === 'fires'
      ) {
        modalText = [
          `Welcome to the new home for Global Forest Watch Fires data and insights!
          Explore the links to fire data and analyses below. `,
          <button
            key="button"
            onClick={() => {
              setContactUsOpen();
            }}
          >
            Contact us
          </button>,
          " if you don't find what you're looking for.",
        ];
      }
    }

    return (
      <Modal
        isOpen={open && !!modalText}
        contentLabel="Global Forest Watch Fires"
        onRequestClose={() => {
          setModalFiresOpen(false);
        }}
        title="Global Forest Watch Fires."
        className="c-gfw-fires-modal"
      >
        <div className="fires-modal-content">
          <p>{modalText}</p>
        </div>
      </Modal>
    );
  }
}

ModalGFWFires.propTypes = {
  open: PropTypes.bool,
  location: PropTypes.object,
};

export default ModalGFWFires;
