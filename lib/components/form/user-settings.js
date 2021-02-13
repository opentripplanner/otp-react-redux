import clone from 'clone'
import moment from 'moment'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { forgetSearch, toggleTracking } from '../../actions/api'
import { setQueryParam } from '../../actions/form'
import { forgetPlace, forgetStop, setLocation } from '../../actions/map'
import { setViewedStop } from '../../actions/ui'
import * as userActions from '../../actions/user'
import { LinkWithQuery } from '../form/connected-links'
import { UnpaddedList } from './styled' 
import MainPanelPlace from '../user/places/main-panel-place'
import { PLACES_PATH } from '../../util/constants'
import { convertToLocationFieldLocation, convertToPlace } from '../../util/user'

const { matchLatLon } = coreUtils.map
const { summarizeQuery } = coreUtils.query

class UserSettings extends Component {
  _disableTracking = () => {
    const { user, toggleTracking } = this.props
    if (!user.trackRecent) return
    const hasRecents = user.recentPlaces.length > 0 || user.recentSearches.length > 0
    // If user has recents and does not confirm deletion, return without doing
    // anything.
    if (hasRecents && !window.confirm('You have recent searches and/or places stored. Disabling storage of recent places/searches will remove these items. Continue?')) {
      return
    }
    // Disable tracking if we reach this statement.
    toggleTracking(false)
  }

  _enableTracking = () => !this.props.user.trackRecent && this.props.toggleTracking(true)

  _getLocations = () => {
      //see notes regarding persistence strategy
      //refactor obtaining the locations.
    const { loggedInUser, user } = this.props
    return clone(user.locations)
    // const savedLocations = loggedInUser ? clone(loggedInUser.savedLocations) : []
    // Identify saved locations for non-'forgettability' purposes.
    // savedLocations.forEach(l => { l.origin = 'loggedInUser' })

    // return [...savedLocations, ...locations]
  }

  render () {
    const { loggedInUser, storageDisclaimer, user } = this.props
    const { favoriteStops, trackRecent, recentPlaces, recentSearches } = user
    // Clone locations in order to prevent blank locations from seeping into the
    // app state/store.
    const locations = this._getLocations()
    const loggedInUserLocations = loggedInUser ? loggedInUser.savedLocations : []
    // Insert additional location types before 'custom' if needed.
    const order = ['home', 'work', 'suggested', 'stop', 'recent']
    const sortedLocations = locations
      .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))

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
          {/* Middleware locations */}
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
        {trackRecent && recentPlaces.length > 0 &&
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
        {trackRecent && recentSearches.length > 0 &&
          <div className='recent-searches-container'>
            <hr />
            <div className='section-header'>Recent searches</div>
            <UnpaddedList>
              {recentSearches
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(search => {
                  return <RecentSearch key={search.id} search={search} {...this.props} />
                })
              }
            </UnpaddedList>
          </div>
        }
        <hr />
        <div className='remember-settings'>
          <div className='section-header'>My preferences</div>
          <small>Remember recent searches/places?</small>
          <Button
            bsSize='xsmall'
            bsStyle='link'
            className={trackRecent ? 'active' : ''}
            onClick={this._enableTracking}>Yes</Button>
          <Button
            bsSize='xsmall'
            bsStyle='link'
            className={!trackRecent ? 'active' : ''}
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

class RecentSearch extends Component {
  _onSelect = () => {
    const { search, setQueryParam } = this.props
    // Update query params and initiate search.
    setQueryParam(search.query, search.id)
  }

  _onForget = () => this.props.forgetSearch(this.props.search.id)

  render () {
    const { search, user } = this.props
    const { query, timestamp } = search
    const name = summarizeQuery(query, user.locations)
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
        onDelete={this._onForget}
        place={place}
      />
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    currentPosition: state.otp.location.currentPosition,
    loggedInUser: state.user.loggedInUser,
    nearbyStops: state.otp.location.nearbyStops,
    query: state.otp.currentQuery,
    sessionSearches: state.otp.location.sessionSearches,
    stopsIndex: state.otp.transitIndex.stops,
    storageDisclaimer: state.otp.config.language.storageDisclaimer,
    user: state.otp.user
  }
}

const mapDispatchToProps = {
  deleteUserPlace: userActions.deleteUserPlace,
  forgetPlace,
  forgetSearch,
  forgetStop,
  setLocation,
  setQueryParam,
  setViewedStop,
  toggleTracking
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings)
