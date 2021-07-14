import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Button from 'components/ui/button';
import Icon from 'components/ui/icon';
import Checkbox from 'components/ui/checkbox';

import closeIcon from 'assets/icons/close.svg?sprite';

import './styles.scss';

class PromptTooltip extends PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      index,
      step,
      backProps,
      closeProps,
      primaryProps,
      tooltipProps,
      size,
      title,
      showPrompts,
      handleShowPrompts,
    } = this.props;
    const { content, actions } = step;
    const { learnHow } = actions || {};
    const stepNum = index + 1;
    const isLastStep = stepNum === size;

    return (
      <div className="c-prompt-tooltip" {...tooltipProps}>
        <button className="step-close" {...closeProps}>
          <Icon className="step-close-btn" icon={closeIcon} />
        </button>
        <div className="step-title">
          {`${title}${size > 1 ? ` · ${index + 1}/${size}` : ''}`}
        </div>
        <div className="step-content">
          {typeof content === 'string' ? content : content}
        </div>
        <div className="step-actions">
          <div className={cx('step-btns', { 'align-left': learnHow })}>
            {actions && actions.returnToTour && (
              <button className="step-nav-btn" onClick={actions.returnToTour}>
                BACK
              </button>
            )}
            {size > 1 && (
              <button
                className="step-nav-btn"
                {...backProps}
                style={{
                  opacity: index !== 0 ? 1 : 0,
                }}
              >
                BACK
              </button>
            )}
            {isLastStep && size > 1 && (
              <button className="step-nav-btn" {...closeProps}>
                CLOSE
              </button>
            )}
            {size !== 1 && !isLastStep && (
              <button className="step-nav-btn" {...primaryProps}>
                NEXT
              </button>
            )}
            {size === 1 && !step?.bypassUserDisableTips && (
              <button
                className="show-prompts-btn"
                onClick={() => handleShowPrompts(!showPrompts)}
              >
                <Checkbox className="prompts-checkbox" value={showPrompts} />
                Show me tips
              </button>
            )}
          </div>
          {learnHow && (
            <Button theme="theme-button-small" onClick={() => learnHow()}>
              LEARN HOW
            </Button>
          )}
        </div>
      </div>
    );
  }
}

PromptTooltip.propTypes = {
  closeProps: PropTypes.object,
  backProps: PropTypes.object,
  step: PropTypes.object,
  primaryProps: PropTypes.object,
  isLastStep: PropTypes.bool,
  index: PropTypes.number,
  numOfSteps: PropTypes.number,
  tooltipProps: PropTypes.object,
  size: PropTypes.number,
  title: PropTypes.string,
  showPrompts: PropTypes.bool,
  handleShowPrompts: PropTypes.func,
};

export default PromptTooltip;
