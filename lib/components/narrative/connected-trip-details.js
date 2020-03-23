import { connect } from 'react-redux'
import TripDetails from '@opentripplanner/trip-details'

import { getTimeFormat, getLongDateFormat } from '../../util/time'

// Connect imported TripDetails class to redux store.

const mapStateToProps = (state, ownProps) => {
  return {
    routingType: state.otp.currentQuery.routingType,
    tnc: state.otp.tnc,
    timeFormat: getTimeFormat(state.otp.config),
    longDateFormat: getLongDateFormat(state.otp.config)
  }
}

export default connect(mapStateToProps)(TripDetails)
