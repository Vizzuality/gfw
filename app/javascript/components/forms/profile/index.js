import { connect } from 'react-redux';

import Component from './component';
import * as actions from './actions';

const mapStateToProps = ({ myGfw, countryData }) => ({
  countries: countryData && countryData.countries,
  ...(myGfw &&
    myGfw.data && {
      initialValues: {
        ...myGfw.data,
        signUpForTesting: myGfw.data.signUpForTesting ? ['yes'] : false
      }
    })
});

export default connect(mapStateToProps, actions)(Component);
