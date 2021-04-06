import PropTypes from 'prop-types';
import cx from 'classnames';

import { Button } from 'gfw-components';

import './styles.scss';

const BigCard = ({ className, image, title, description, button }) => (
  <div className={cx('c-big-card', className)}>
    <div className="big-card-content">
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
    {image && <img className="big-card-image" src={image} alt={title} />}
  </div>
);

BigCard.propTypes = {
  className: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  button: PropTypes.shape({
    label: PropTypes.string,
    href: PropTypes.string,
  }),
};

export default BigCard;
