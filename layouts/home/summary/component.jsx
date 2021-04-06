import React, { useRef } from 'react';

import { Button, Row, Column, Desktop, Mobile, Carousel } from 'gfw-components';

import Icon from 'components/ui/icon';
import BigCard from 'components/ui/big-card';

import arrowIcon from 'assets/icons/arrow-down.svg?sprite';

import SUMMARY_CARDS from './config';

import './styles.scss';

const HomeSummary = () => {
  const summaryEl = useRef(null);

  const renderSummaryCards = () =>
    SUMMARY_CARDS.map((c) => (
      <BigCard className="summary-card" key={c.title} {...c} />
    ));

  return (
    <Row>
      <Column>
        <div className="c-home-summary" ref={summaryEl}>
          <Button
            className="scroll-to-btn"
            round
            onClick={() => {
              window.scrollTo({
                behavior: 'smooth',
                left: 0,
                top: summaryEl?.current?.offsetTop,
              });
            }}
          >
            <Icon icon={arrowIcon} />
          </Button>
          <Desktop>
            <Carousel settings={{ dots: true }}>
              {renderSummaryCards()}
            </Carousel>
          </Desktop>
          <Mobile>
            <Carousel settings={{ dots: true, slidesToShow: 1 }}>
              {renderSummaryCards()}
            </Carousel>
          </Mobile>
        </div>
      </Column>
    </Row>
  );
};

export default HomeSummary;
