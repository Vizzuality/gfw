import React, { PureComponent } from 'react';
import Button from 'components/ui/button';
import { Link as AnchorLink } from 'react-scroll';

import { Row, Column } from 'gfw-components';

import './styles.scss';

class SectionJoin extends PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <section className="l-section-join">
        <Row>
          <Column className="content">
            <h4>
              <i>We welcome others to join the growing GFW partnership.</i>
            </h4>
            <AnchorLink to="contact" spy smooth duration={500}>
              <Button className="anchor">EMAIL US</Button>
            </AnchorLink>
          </Column>
        </Row>
      </section>
    );
  }
}

SectionJoin.propTypes = {};

export default SectionJoin;