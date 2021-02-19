/* eslint-disable complexity */
import moment from 'moment'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { LinkWithQuery } from '../form/connected-links'
import MainPanelPlace from '../user/places/main-panel-place'
import { PLACES_PATH } from '../../util/constants'
import { convertToLocationFieldLocation, convertToPlace, isHome, isWork } from '../../util/user'
import { UnpaddedList } from './styled'

const { matchLatLon } = coreUtils.map
const { summarizeQuery } = coreUtils.query

class UserSettings extends Component {
  _disableTracking = () => {
    const { localUser, localUserTripRequests, toggleTracking } = this.props
    if (!localUser.storeTripHistory) return
    const hasRecents = localUser.recentPlaces.length > 0 || localUserTripRequests.length > 0
    // If user has recents and does not confirm deletion, return without doing
    // anything.
    if (hasRecents && !window.confirm('You have recent searches and/or places stored. Disabling storage of recent places/searches will remove these items. Continue?')) {
      return
    }
    // Disable tracking if we reach this statement.
    toggleTracking(false)
  }

  _enableTracking = () => !this.props.localUser.storeTripHistory && this.props.toggleTracking(true)

  _getLocations = user => {
    const locations = [...user.savedLocations]
    if (!locations.find(isWork)) {
      locations.push({
        blank: true,
        icon: 'briefcase',
        id: 'work',
        name: 'click to add',
        type: 'work'
      })
    }
    if (!locations.find(isHome)) {
      locations.push({
        blank: true,
        icon: 'home',
        id: 'home',
        name: 'click to add',
        type: 'home'
      })
    }
    return locations
  }

  render () {
    const {
      forgetSearch,
      localUser,
      loggedInUser,
      loggedInUserTripRequests,
      persistenceStrategy,
      setQueryParam,
      storageDisclaimer,
      tripRequests,
      trueUser
    } = this.props
    console.log(loggedInUserTripRequests)

    if (loggedInUser && persistenceStrategy === 'otp_middleware') { //use constants
      const loggedInUserLocations = loggedInUser ? loggedInUser.savedLocations : []
      return (
        <div className='user-settings'>
          <div className='section-header'>
              My saved places (
            <LinkWithQuery to='/account/settings'>
                manage
            </LinkWithQuery>
              )
          </div>
          <UnpaddedList>
            {loggedInUserLocations.map((place, index) => {
              return (
                <SavedPlace
                  {...this.props}
                  key={index}
                  path={`${PLACES_PATH}/${index}`}
                  place={place}
                />
              )
            }
            )}
          </UnpaddedList>

          <RecentTripRequests
            forgetSearch={forgetSearch}
            setQueryParam={setQueryParam}
            tripRequests={tripRequests}
            user={trueUser}
          />
        </div>
      )
    } else if (persistenceStrategy === 'localStorage') {
      const { favoriteStops, storeTripHistory, recentPlaces } = localUser
      // Clone locations in order to prevent blank locations from seeping into the
      // app state/store.
      const locations = this._getLocations(localUser)
      // Insert additional location types before 'custom' if needed.
      const order = ['home', 'work', 'suggested', 'stop', 'recent']
      const sortedLocations = locations
        .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
      return (
        <div className='user-settings'>
          <div className='section-header'>
              My saved places
          </div>
          <UnpaddedList>
            {sortedLocations.map((location, index) => {
              return <Place key={location.id} location={location} {...this.props} />
            })}
          </UnpaddedList>
          <hr />

          <div className='section-header'>Favorite stops</div>
          <UnpaddedList>
            {favoriteStops.length > 0
              ? favoriteStops.map(location => {
                return <Place key={location.id} location={location} {...this.props} />
              })
              : <small>No favorite stops </small>
            }
          </UnpaddedList>

          {storeTripHistory && recentPlaces.length > 0 &&
            <div className='recent-places-container'>
              <hr />
              <div className='section-header'>Recent places</div>
              <UnpaddedList>
                {recentPlaces.map(location => {
                  return <Place key={location.id} location={location} {...this.props} />
                })}
              </UnpaddedList>
            </div>
          }

          <RecentTripRequests
            forgetSearch={forgetSearch}
            setQueryParam={setQueryParam}
            tripRequests={tripRequests}
            user={trueUser}
          />

          <hr />
          <div className='remember-settings'>
            <div className='section-header'>My preferences</div>
            <small>Remember recent searches/places?</small>
            <Button
              bsSize='xsmall'
              bsStyle='link'
              className={storeTripHistory ? 'active' : ''}
              onClick={this._enableTracking}>Yes</Button>
            <Button
              bsSize='xsmall'
              bsStyle='link'
              className={!storeTripHistory ? 'active' : ''}
              onClick={this._disableTracking}>No</Button>
          </div>
          {storageDisclaimer &&
            <div>
              <hr />
              <div className='disclaimer'>
                {storageDisclaimer}
              </div>
            </div>
          }
        </div>
      )
    }

    return null
  }
}

/**
 * Sets the from or to location based on the query using the provided action.
 */
function setFromOrToLocation (location, setLocation, query) {
  // If 'to' not set and 'from' does not match location, set as 'to'.
  if (
    !query.to && (
      !query.from || !matchLatLon(location, query.from)
    )
  ) {
    setLocation({ location, locationType: 'to' })
  } else if (
    // Vice versa for setting as 'from'.
    !query.from &&
      !matchLatLon(location, query.to)
  ) {
    setLocation({ location, locationType: 'from' })
  }
}

/**
 * Wraps MainPanelPlace for places saved from loggedInUser.
 */
class SavedPlace extends Component {
  _handleDelete = () => {
    const { deleteUserPlace, place } = this.props
    deleteUserPlace(place)
  }

  _handleClick = () => {
    const { place, query, setLocation } = this.props
    const location = convertToLocationFieldLocation(place)
    setFromOrToLocation(location, setLocation, query)
  }

  render () {
    const { path, place } = this.props
    return (
      <MainPanelPlace
        onClick={place.address ? this._handleClick : null}
        onDelete={this._handleDelete}
        path={path}
        place={place}
      />
    )
  }
}

/**
 * Wraps MainPanelPlace for places from localStorage (recents, favorite stops...).
 */
class Place extends Component {
  _onSelect = () => {
    const { location, query, setLocation } = this.props
    if (location.blank) {
      window.alert(`Enter origin/destination in the form (or set via map click) and click the resulting marker to set as ${location.type} location.`)
    } else {
      setFromOrToLocation(location, setLocation, query)
    }
  }

  _onView = () => {
    const { location, setViewedStop } = this.props
    setViewedStop({ stopId: location.id })
  }

  _onForget = () => {
    const { forgetPlace, forgetStop, location } = this.props
    if (location.type === 'stop') forgetStop(location.id)
    else forgetPlace(location.id)
  }

  render () {
    const { location } = this.props
    return (
      <MainPanelPlace
        onClick={this._onSelect}
        onDelete={this._onForget}
        onView={this._onView}
        place={convertToPlace(location)}
      />
    )
  }
}

/**
 * Wraps MainPanelPlace for recent trip requests.
 */
class TripRequest extends Component {
  _onSelect = () => {
    const { setQueryParam, tripRequest } = this.props
    const { id, query } = tripRequest
    // Update query params and initiate search.
    setQueryParam(query, id)
  }

  _onForget = () => this.props.forgetSearch(this.props.tripRequest.id)

  render () {
    const { tripRequest, user } = this.props
    const { canDelete = true, query, timestamp } = tripRequest
    const name = summarizeQuery(query, user.savedLocations)
    const timeInfo = moment(timestamp).fromNow()

    const place = {
      details: timeInfo,
      icon: 'clock-o',
      name,
      title: `${name} (${timeInfo})`
    }

    return (
      <MainPanelPlace
        onClick={this._onSelect}
        onDelete={canDelete && this._onForget}
        place={place}
      />
    )
  }
}

/**
 * Renders a list of recent trip requests, most recent first,
 * if permitted by user.
 */
const RecentTripRequests = ({ forgetSearch, setQueryParam, tripRequests, user }) => (
  user.storeTripHistory && tripRequests && tripRequests.length > 0 && (
    <div className='recent-searches-container'>
      <hr />
      <div className='section-header'>Recent searches</div>
      <UnpaddedList>
        {tripRequests
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(tripReq => (
            <TripRequest
              forgetSearch={forgetSearch}
              key={tripReq.id}
              setQueryParam={setQueryParam}
              tripRequest={tripReq}
              user={user}
            />
          ))
        }
      </UnpaddedList>
    </div>
  )
)
// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { config, currentQuery, location, transitIndex } = state.otp
  const { language, persistence = {} } = config
  console.log(config)

  const { localUser, localUserTripRequests, loggedInUser, loggedInUserTripRequests } = state.user
  return {
    config,
    currentPosition: location.currentPosition,
    localUser, // these users should be merged in mapStateToProps
    localUserTripRequests,
    loggedInUser,
    loggedInUserTripRequests,
    nearbyStops: location.nearbyStops,
    persistenceStrategy: persistence.enabled && persistence.strategy,
    query: currentQuery,
    sessionSearches: location.sessionSearches,
    stopsIndex: transitIndex.stops,
    storageDisclaimer: language.storageDisclaimer,
    tripRequests: loggedInUser ? loggedInUserTripRequests : localUserTripRequests,
    trueUser: loggedInUser || localUser
  }
}

const mapDispatchToProps = {
  deleteUserPlace: userActions.deleteUserPlace,
  forgetPlace: mapActions.forgetPlace,
  forgetSearch: apiActions.forgetSearch,
  forgetStop: mapActions.forgetStop,
  setLocation: mapActions.setLocation,
  setQueryParam: formActions.setQueryParam,
  setViewedStop: uiActions.setViewedStop,
  toggleTracking: apiActions.toggleTracking
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings)
