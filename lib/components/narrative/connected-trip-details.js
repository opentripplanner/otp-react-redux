import { connect } from 'react-redux'
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

const mapStateToProps = (state) => {
  const { itinerary } = state.otp.config
  return {
    defaultFareKey: itinerary?.defaultFareKey || undefined,
    displayCalories:
      typeof itinerary?.displayCalories === 'boolean'
        ? itinerary?.displayCalories
        : undefined,
    fareDetailsLayout: itinerary?.fareDetailsLayout || undefined,
    fareKeyNameMap: itinerary?.fareKeyNameMap || {}
  }
}

export default connect(mapStateToProps)(TripDetails)
