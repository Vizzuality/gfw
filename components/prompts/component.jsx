import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';

import PromptTooltip from 'components/prompts/prompt-tooltip';

class PromptTour extends PureComponent {
  render() {
    const {
      open,
      steps,
      title,
      stepIndex,
      handleStateChange,
      settings,
      showPrompts,
      handleShowPrompts,
    } = this.props;

    return (
      <Joyride
        steps={steps}
        run={open}
        stepIndex={stepIndex}
        continuous
        callback={(data) => {
          const { action, index, type, status, step } = data;
          const { actions, delay: actionDelay } = step || {};
          const { prev, next } = actions || {};

          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            // Need to set our running state to false, so we can restart if we click start again.
            handleStateChange({ open: false, stepIndex: 0, stepsKey: '' });
          } else if (data.action === 'close' || data.type === 'tour:end') {
            handleStateChange({
              stepIndex: 0,
              open: false,
            });
            if (step?.actions?.onClose) {
              step.actions.onClose();
            }
          } else if (
            [
              EVENTS.STEP_AFTER,
              EVENTS.TARGET_NOT_FOUND,
              EVENTS.TOUR_START,
            ].includes(type)
          ) {
            const newStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
            // Update state to advance the tour
            let delay = actionDelay || 400;

            if (action === 'prev' && prev) {
              prev();
            }

            if (action === 'next' && next) {
              next();
            }

            if (action === 'start' && prev && index === 0) {
              prev();
            }

            if (
              ((action === 'next' && !next) || (action === 'prev' && !prev)) &&
              action !== 'start'
            ) {
              delay = 0;
            }

            if (action === 'prev' || action === 'next') {
              setTimeout(() => {
                handleStateChange({
                  stepIndex: newStepIndex,
                });
              }, delay);
            }
          }
        }}
        spotlightPadding={0}
        tooltipComponent={(step) => (
          <PromptTooltip
            {...step}
            title={title}
            showPrompts={showPrompts}
            handleShowPrompts={handleShowPrompts}
          />
        )}
        styles={{
          options: {
            overlayColor: 'rgba(17, 55, 80, 0.4)',
            zIndex: 10000,
            arrowColor: '#333',
          },
        }}
        {...settings}
      />
    );
  }
}

PromptTour.propTypes = {
  open: PropTypes.bool,
  steps: PropTypes.array,
  setTourClosed: PropTypes.func,
  title: PropTypes.string,
  stepIndex: PropTypes.number,
  handleStateChange: PropTypes.func,
  settings: PropTypes.object,
  showPrompts: PropTypes.bool,
  handleShowPrompts: PropTypes.func,
  initAction: PropTypes.func,
};

export default PromptTour;
