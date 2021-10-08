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
import PlaceShortcut from '../user/places/place-shortcut'
import { StyledMainPanelPlace } from '../user/places/styled'
import { PERSIST_TO_OTP_MIDDLEWARE } from '../../util/constants'
import { getPersistenceStrategy, isHome, isWork } from '../../util/user'

import { UnpaddedList } from './styled'

const { summarizeQuery } = coreUtils.query

class UserSettings extends Component {
  _disableTracking = () => {
    const { localUser, toggleTracking } = this.props
    const { recentPlaces, recentSearches, storeTripHistory } = localUser
    if (!storeTripHistory) return
    const hasRecents = (recentPlaces && recentPlaces.length > 0) ||
      (recentSearches && recentSearches.length > 0)

    // If user has recents and does not confirm deletion, return without doing
    // anything.
    if (hasRecents && !window.confirm(
      'You have recent searches and/or places stored. Disabling storage of recent places/searches will remove these items. Continue?'
    )) {
      return
    }
    // Disable tracking if we reach this statement.
    toggleTracking(false)
  }

  _enableTracking = () => !this.props.localUser.storeTripHistory && this.props.toggleTracking(true)

  _getLocalStorageOnlyContent = () => {
    const {
      deleteFavoriteStop,
      deleteLocalUserRecentPlace,
      forgetSearch,
      localUser,
      setQueryParam,
      setViewedStop,
      storageDisclaimer
    } = this.props

    const { favoriteStops, recentPlaces, recentSearches, storeTripHistory } = localUser
    return (
      <>
        {/* Favorite stops are shown regardless of tracking. */}
        <Places
          getDetailText={location => `Stop ID: ${location.id}`}
          getMainText={location => location.address || location.name}
          header='Favorite stops'
          onDelete={deleteFavoriteStop}
          onView={setViewedStop}
          places={favoriteStops}
          textIfEmpty='No favorite stops'
        />

        {storeTripHistory && <Places
          getDetailText={location => ''}
          getMainText={location => location.address || location.name}
          header='Recent places'
          onDelete={deleteLocalUserRecentPlace}
          places={recentPlaces}
        />}
        <RecentTrips
          forgetSearch={forgetSearch}
          getDetailText={trip => `Stop ID: ${location.id}`}
          getMainText={trip => location.address || location.name}
          setQueryParam={setQueryParam}
          tripRequests={recentSearches}
          user={localUser}
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
      </>
    )
  }

  _getLocations = user => {
    const locations = [...user.savedLocations]
    if (!locations.find(isWork)) {
      locations.push({
        blank: true,
        icon: 'briefcase',
        id: 'work',
        type: 'work'
      })
    }
    if (!locations.find(isHome)) {
      locations.push({
        blank: true,
        icon: 'home',
        id: 'home',
        type: 'home'
      })
    }
    return locations
  }

  render () {
    const {
      className,
      deleteUserPlace,
      localUser,
      loggedInUser,
      persistenceStrategy
    } = this.props
    // Clone locations in order to prevent blank locations from seeping into the
    // app state/store.
    const locations = this._getLocations(localUser)
    const order = ['home', 'work', 'suggested', 'stop', 'recent']
    const sortedLocations = locations
      .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
    const isUsingOtpMiddleware = persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE
    const userNotLoggedIn = isUsingOtpMiddleware && !loggedInUser
    if (userNotLoggedIn) return null
    return (
      <div className={`user-settings ${className}`}>
        {/* Sorted locations are shown regardless of tracking. */}
        <Places
          getDetailText={location => location.address || location.name || `Set your ${location.type} address`}
          getMainText={location => location.type}
          header={isUsingOtpMiddleware &&
            <>
              My saved places (
              <LinkWithQuery to='/account/settings'>manage</LinkWithQuery>
              )
            </>
          }
          onDelete={deleteUserPlace}
          places={sortedLocations}
          separator={false}
        />
        {!isUsingOtpMiddleware && this._getLocalStorageOnlyContent()}
      </div>
    )
  }
}

/**
 * Displays a list of places with a header.
 */
const Places = ({
  // FIXME_QBD: are these defaults still needed?
  getDetailText = location => location.name,
  getMainText = location => location.type,
  header,
  onDelete,
  onView,
  places,
  separator = true,
  textIfEmpty
}) => {
  const shouldRender = textIfEmpty || (places && places.length > 0)
  return shouldRender && (
    <>
      {separator && <hr />}
      {header && <div className='section-header'>{header}</div>}
      <UnpaddedList>
        {places.length > 0
          ? places.map((location, index) => {
            return (
              <PlaceShortcut
                detailText={getDetailText(location)}
                icon={location.icon}
                index={index}
                key={location.id || index}
                mainText={getMainText(location)}
                onDelete={onDelete}
                onView={onView}
                place={location}
              />
            )
          })
          : (textIfEmpty && <small>{textIfEmpty}</small>)
        }
      </UnpaddedList>
    </>
  )
}

/**
 * Wrapper for recent trip requests.
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
    const mainText = summarizeQuery(query, user.savedLocations)
    const timeInfo = moment(timestamp).fromNow()

    return (
      <StyledMainPanelPlace
        className='place-item'
        detailText={timeInfo}
        icon='clock-o'
        mainText={mainText}
        onClick={this._onSelect}
        onDelete={canDelete && this._onForget}
      />
    )
  }
}

/**
 * Renders a list of recent trip requests, most recent first,
 * if permitted by user.
 */
const RecentTrips = ({ forgetSearch, setQueryParam, tripRequests = null, user }) => (
  // Note: tripRequests can be undefined,
  // so we have to coerce it to null above to make a valid render.
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
  const { language, persistence } = config
  const { currentPosition, nearbyStops, sessionSearches } = location
  const { localUser, loggedInUser, loggedInUserTripRequests } = state.user
  return {
    config,
    currentPosition,
    localUser,
    loggedInUser,
    loggedInUserTripRequests,
    nearbyStops,
    persistenceStrategy: getPersistenceStrategy(persistence),
    query: currentQuery,
    sessionSearches,
    stopsIndex: transitIndex.stops,
    storageDisclaimer: language.storageDisclaimer
  }
}

const mapDispatchToProps = {
  deleteFavoriteStop: userActions.deleteFavoriteStop,
  deleteLocalUserRecentPlace: userActions.deleteLocalUserRecentPlace,
  deleteLoggedInUserPlace: userActions.deleteLoggedInUserPlace,
  deleteUserPlace: userActions.deleteUserPlace,
  forgetSearch: apiActions.forgetSearch,
  setLocation: mapActions.setLocation,
  setQueryParam: formActions.setQueryParam,
  setViewedStop: uiActions.setViewedStop,
  toggleTracking: apiActions.toggleTracking
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings)
