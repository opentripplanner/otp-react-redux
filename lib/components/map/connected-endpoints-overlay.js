import EndpointsOverlay from '@opentripplanner/endpoints-overlay'
import { connect } from 'react-redux'

import {
  clearLocation,
  forgetPlace,
  setLocation
} from '../../actions/map'
import { rememberPlace } from '../../actions/user'
import { PERSIST_TO_LOCAL_STORAGE, PERSIST_TO_OTP_MIDDLEWARE } from '../../util/constants'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { getOtpUiLocations, getPersistenceStrategy } from '../../util/user'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  // Use query from active search (if a search has been made) or default to
  // current query is no search is available.
  const activeSearch = getActiveSearch(state.otp)
  const query = activeSearch ? activeSearch.query : state.otp.currentQuery
  const showUserSettings = getShowUserSettings(state.otp)
  const { from, to } = query
  // Intermediate places doesn't trigger a re-plan, so for now default to
  // current query. FIXME: Determine with TriMet if this is desired behavior.
  const places = state.otp.currentQuery.intermediatePlaces.filter(p => p)
  const { localUser, loggedInUser } = state.user

  const { persistence } = state.otp.config
  const persistenceStrategy = getPersistenceStrategy(persistence)
  let userSavedLocations = []
  if (persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE) {
    userSavedLocations = getOtpUiLocations(loggedInUser)
  } else if (persistenceStrategy === PERSIST_TO_LOCAL_STORAGE) {
    userSavedLocations = localUser.locations
  }

  return {
    fromLocation: from,
    intermediatePlaces: places,
    locations: userSavedLocations,
    showUserSettings,
    toLocation: to,
    visible: true
  }
}

const mapDispatchToProps = {
  clearLocation,
  forgetPlace,
  rememberPlace,
  setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(EndpointsOverlay)
