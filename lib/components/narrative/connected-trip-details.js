import { connect } from 'react-redux'
import styled from 'styled-components'
import UITripDetails from '@opentripplanner/trip-details'

import { getTimeFormat, getLongDateFormat } from '../../util/time'

const TripDetails = styled(UITripDetails)`
  border: 2px solid gray;
  border-radius: 0;
  padding: 6px 10px;
  margin: 16px 0 10px;
`

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
