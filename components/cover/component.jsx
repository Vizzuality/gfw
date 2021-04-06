import PropTypes from 'prop-types';
import cx from 'classnames';

import { Row, Column } from 'gfw-components';

import './styles.scss';

const Cover = ({
  className,
  title,
  description,
  bgImage,
  bgAlt,
  large,
  children,
}) => (
  <div className={cx('c-cover', { '-large': large }, className)}>
    <img
      className="cover-background-img"
      src={bgImage}
      alt={bgAlt || 'cover background image'}
    />
    <Row>
      <Column width={[1, 2 / 3]} className="cover-wrapper">
        <h1 className={cx('cover-title', { '-with-background': !!bgImage })}>
          {title}
        </h1>
        {Array.isArray(description) ? (
          <div>{description}</div>
        ) : (
          <p>{description}</p>
        )}
        {children}
      </Column>
    </Row>
  </div>
);

Cover.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  large: PropTypes.bool,
  bgImage: PropTypes.string,
  bgAlt: PropTypes.string,
  children: PropTypes.node,
};

export default Cover;
