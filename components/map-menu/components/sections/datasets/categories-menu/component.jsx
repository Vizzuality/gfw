import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Row, Column, Button } from 'gfw-components';

import Icon from 'components/ui/icon';

import './styles.scss';

class CategoriesMenu extends PureComponent {
  render() {
    const { categories, onSelectCategory } = this.props;

    return (
      <div className="c-categories-menu">
        <Row>
          <Column>
            <h2 className="categories-title">DATASETS</h2>
          </Column>
          {categories.map((c) => (
            <Column key={c.category} width={[1 / 4]}>
              <div className="category-item">
                <Button
                  className="category-btn"
                  round
                  size="large"
                  onClick={() =>
                    onSelectCategory({ datasetCategory: c.category })}
                >
                  {!!c.layerCount && (
                    <span className="category-btn-count">{c.layerCount}</span>
                  )}
                  <Icon icon={c.icon} />
                </Button>
                <span className="category-item-label">{c.label}</span>
              </div>
            </Column>
          ))}
        </Row>
      </div>
    );
  }
}

CategoriesMenu.propTypes = {
  categories: PropTypes.array,
  onSelectCategory: PropTypes.func,
};

export default CategoriesMenu;
