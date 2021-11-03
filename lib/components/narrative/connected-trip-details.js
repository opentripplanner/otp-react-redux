import coreUtils from '@opentripplanner/core-utils'
import TripDetailsBase from '@opentripplanner/trip-details'
import { connect } from 'react-redux'
import styled from 'styled-components'

const TripDetails = styled(TripDetailsBase)`
  b {
    font-weight: 600;
  }
`

// Connect imported TripDetails class to redux store.

const mapStateToProps = (state, ownProps) => {
  return {
    defaultFare: state.otp.config.itinerary?.defaultFare || undefined,
    fareKeyNameMap: state.otp.config.itinerary?.fareKeyMap || {},
    longDateFormat: coreUtils.time.getLongDateFormat(state.otp.config),
    messages: state.otp.config.language.tripDetails,
    routingType: state.otp.currentQuery.routingType,
    timeOptions: {
      format: coreUtils.time.getTimeFormat(state.otp.config)
    },
    tnc: state.otp.tnc
  }
}

export default connect(mapStateToProps)(TripDetails)
