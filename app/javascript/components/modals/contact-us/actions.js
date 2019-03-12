import { createAction, createThunkAction } from 'redux-tools';
import { setComponentStateToUrl } from 'utils/stateToUrl';

import { submitContactForm } from 'services/forms';

export const setModalContactUsOpen = createThunkAction(
  'setModalContactUsOpen',
  isOpen => (dispatch, state) => {
    dispatch(
      setComponentStateToUrl({
        key: 'contactUs',
        change: isOpen,
        state
      })
    );
    dispatch(setShowConfirm(false));
  }
);

export const setShowConfirm = createAction('setShowConfirm');
export const setFormSubmitting = createAction('setFormSubmitting');

export const sendContactForm = createThunkAction(
  'sendContactForm',
  data => dispatch => {
    dispatch(setFormSubmitting({ submitting: true, error: false }));
    submitContactForm(data)
      .then(() => {
        dispatch(setShowConfirm(true));
      })
      .catch(error => {
        console.error(error);
        dispatch(setFormSubmitting({ submitting: false, error: true }));
      });
  }
);
