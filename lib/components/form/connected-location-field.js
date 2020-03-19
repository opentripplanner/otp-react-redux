import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  MenuItemA
} from '@opentripplanner/location-field/lib/styled'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { clearLocation, onLocationSelected } from '../../actions/map'
import { addLocationSearch, getCurrentPosition } from '../../actions/location'
import { findNearbyStops } from '../../actions/api'
import { getActiveSearch, getShowUserSettings } from '../../util/state'

const StyledLocationField = styled(LocationField)`
  width: 100%;

  ${DropdownContainer} {
    display: table-cell;
    vertical-align: middle;
    width: 1%;
  }

  ${FormGroup} {
    display: table;
    padding: 6px 12px;
    width: 100%;
  }

  ${Input} {
    display: table-cell;
    padding: 6px 12px;
    width: 100%;
  }

  ${InputGroup} {
    width: 100%;
  }

  ${InputGroupAddon} {
    display: table-cell;
    vertical-align: middle;
    width: 1%;
  }

  ${MenuItemA} {
    text-decoration: none;
  }

  ${MenuItemA}:hover {
    color: #333;
  }
`

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { config, currentQuery, location, transitIndex, user } = state.otp
  const { currentPosition, nearbyStops, sessionSearches } = location
  const activeSearch = getActiveSearch(state.otp)
  const query = activeSearch ? activeSearch.query : currentQuery
  return {
    currentPosition,
    geocoderConfig: config.geocoder,
    location: query[ownProps.locationType],
    nearbyStops,
    sessionSearches,
    showUserSettings: getShowUserSettings(state.otp),
    stopsIndex: transitIndex.stops,
    userLocationsAndRecentPlaces: [...user.locations, ...user.recentPlaces]
  }
}

const mapDispatchToProps = {
  addLocationSearch,
  findNearbyStops,
  getCurrentPosition,
  onLocationSelected,
  clearLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(StyledLocationField)
