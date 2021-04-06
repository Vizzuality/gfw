import PropTypes from 'prop-types';
import cx from 'classnames';

import { Button } from 'gfw-components';

import './styles.scss';

const SimpleCard = ({ className, image, title, description, button }) => (
  <div className={cx('c-simple-card', className)}>
    {image && <img className="simple-card-image" src={image} alt={title} />}
    <div className="simple-card-content">
      <div>
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
      </div>
      {button && (
        <a href={button.href}>
          <Button light>{button.label}</Button>
        </a>
      )}
    </div>
  </div>
);

SimpleCard.propTypes = {
  className: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  button: PropTypes.shape({
    label: PropTypes.string,
    href: PropTypes.string,
  }),
};

export default SimpleCard;
