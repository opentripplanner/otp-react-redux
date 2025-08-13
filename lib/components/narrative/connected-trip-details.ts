import { connect } from 'react-redux'
import styled from 'styled-components'
import TripDetailsBase from '@opentripplanner/trip-details'

import { AppReduxState } from '../../util/state-types'

const TripDetails = styled(TripDetailsBase)`
  b {
    font-weight: 600;
  }
  margin-left: 5px;
  margin-right: 5px;
`

// Connect imported TripDetails class to redux store.

const mapStateToProps = (state: AppReduxState) => {
  const { co2, itinerary } = state.otp.config
  const { defaultFareType } = itinerary
  return {
    co2Config: co2,
    defaultFareType
  }
}

export default connect(mapStateToProps)(TripDetails)
