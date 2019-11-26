import { connect } from 'react-redux'

import { setLocation, setLocationToCurrent, clearLocation } from '../../actions/map'
import { addLocationSearch, getCurrentPosition } from '../../actions/location'
import { findNearbyStops } from '../../actions/api'
// FIXME: LocationField will be imported from new otp-ui component lib
import LocationField from './location-field-2'
import { getActiveSearch, getShowUserSettings } from '../../util/state'

// connect to redux store
const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const query = activeSearch ? activeSearch.query : state.otp.currentQuery
  const location = query[ownProps.type]
  const showUserSettings = getShowUserSettings(state.otp)
  return {
    config: state.otp.config,
    location,
    user: state.otp.user,
    currentPosition: state.otp.location.currentPosition,
    sessionSearches: state.otp.location.sessionSearches,
    nearbyStops: state.otp.location.nearbyStops,
    showUserSettings,
    stopsIndex: state.otp.transitIndex.stops
  }
}

// Add redux actions
const mapDispatchToProps = {
  addLocationSearch,
  findNearbyStops,
  getCurrentPosition,
  onLocationSelected: setLocation,
  setLocationToCurrent,
  clearLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationField)
