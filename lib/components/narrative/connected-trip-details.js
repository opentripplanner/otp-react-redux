import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'
import styled from 'styled-components'
import TripDetailsBase from '@opentripplanner/trip-details'

const TripDetails = styled(TripDetailsBase)`
  b {
    font-weight: 600;
  }
  margin-left: 5px;
  margin-right: 5px;
`

// Connect imported TripDetails class to redux store.

const mapStateToProps = (state, ownProps) => {
  return {
    defaultFareKey: state.otp.config.itinerary?.defaultFareKey || undefined,
    fareKeyNameMap: state.otp.config.itinerary?.fareKeyNameMap || {},
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
