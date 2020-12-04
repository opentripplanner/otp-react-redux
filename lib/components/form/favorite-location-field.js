import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  Input as LocationFieldInput,
  InputGroup as LocationFieldInputGroup
} from '@opentripplanner/location-field/lib/styled'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as locationActions from '../../actions/location'
import { getShowUserSettings } from '../../util/state'

const StyledLocationField = styled(LocationField)`
  width: 100%;

  ${DropdownContainer} {
    width: 0;
    & > button {
      display: none;
    }
  }

  ${LocationFieldInputGroup} {
    border: none;
    width: 100%;
  }
  ${LocationFieldInput} {
    display: table-cell;
    font-size: 100%;
    line-height: 20px;
    padding: 6px 12px;
    width: 100%;
  }
`

// connect LocationField to redux store
// TODO: Refactor. Each time we want to apply styles to LocationField, we need to reconnect it.
const mapStateToProps = (state, ownProps) => {
  const { config, location, transitIndex, user } = state.otp
  const { currentPosition, nearbyStops, sessionSearches } = location
  return {
    currentPosition,
    geocoderConfig: config.geocoder,
    nearbyStops,
    sessionSearches,
    showUserSettings: getShowUserSettings(state.otp),
    stopsIndex: transitIndex.stops,
    userLocationsAndRecentPlaces: [...user.locations, ...user.recentPlaces]
  }
}

const mapDispatchToProps = {
  addLocationSearch: locationActions.addLocationSearch,
  findNearbyStops: apiActions.findNearbyStops,
  getCurrentPosition: locationActions.getCurrentPosition
}

export default connect(mapStateToProps, mapDispatchToProps)(StyledLocationField)
