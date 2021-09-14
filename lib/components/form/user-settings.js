import moment from 'moment'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { forgetSearch, toggleTracking } from '../../actions/api'
import { setQueryParam } from '../../actions/form'
import { forgetPlace, forgetStop, setLocation } from '../../actions/map'
import { setViewedStop } from '../../actions/ui'
import Icon from '../util/icon'

const { formatStoredPlaceName, getDetailText, matchLatLon } = coreUtils.map
const { summarizeQuery } = coreUtils.query

const BUTTON_WIDTH = 40

class UserSettings extends Component {
  _disableTracking = () => {
    const { toggleTracking, user } = this.props
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

  _getLocations = (user) => {
    const locations = [...user.locations]
    if (!locations.find(l => l.type === 'work')) {
      locations.push({
        blank: true,
        icon: 'briefcase',
        id: 'work',
        name: 'click to add',
        type: 'work'
      })
    }
    if (!locations.find(l => l.type === 'home')) {
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
    const { storageDisclaimer, user } = this.props
    const { favoriteStops, recentPlaces, recentSearches, trackRecent } = user
    // Clone locations in order to prevent blank locations from seeping into the
    // app state/store.
    const locations = this._getLocations(user)
    const order = ['home', 'work', 'suggested', 'stop', 'recent']
    const sortedLocations = locations
      .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
    return (
      <div className='user-settings'>
        <ul style={{ padding: 0 }}>
          {sortedLocations.map(location => {
            return <Place key={location.id} location={location} {...this.props} />
          })}
        </ul>
        <hr />
        <div className='section-header'>Favorite stops</div>
        <ul style={{ padding: 0 }}>
          {favoriteStops.length > 0
            ? favoriteStops.map(location => {
              return <Place key={location.id} location={location} {...this.props} />
            })
            : <small>No favorite stops </small>
          }
        </ul>
        {trackRecent && recentPlaces.length > 0 &&
          <div className='recent-places-container'>
            <hr />
            <div className='section-header'>Recent places</div>
            <ul style={{ padding: 0 }}>
              {recentPlaces.map(location => {
                return <Place key={location.id} location={location} {...this.props} />
              })}
            </ul>
          </div>
        }
        {trackRecent && recentSearches.length > 0 &&
          <div className='recent-searches-container'>
            <hr />
            <div className='section-header'>Recent searches</div>
            <ul style={{ padding: 0 }}>
              {recentSearches
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(search => {
                  return <RecentSearch key={search.id} search={search} {...this.props} />
                })
              }
            </ul>
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

class Place extends Component {
  _onSelect = () => {
    const { location, query, setLocation } = this.props
    if (location.blank) {
      window.alert(`Enter origin/destination in the form (or set via map click) and click the resulting marker to set as ${location.type} location.`)
    } else {
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

  _isViewable = () => this.props.location.type === 'stop'

  _isForgettable = () =>
    ['stop', 'home', 'work', 'recent'].indexOf(this.props.location.type) !== -1

  render () {
    const { location } = this.props
    const { blank, icon } = location
    const showView = this._isViewable()
    const showForget = this._isForgettable() && !blank
    // Determine how much to offset width of main button (based on visibility of
    // other buttons sharing the same line).
    let offset = 0
    if (showView) offset += BUTTON_WIDTH
    if (showForget) offset += BUTTON_WIDTH
    return (
      <li className='place-item'>
        <Button
          bsStyle='link'
          className='place-button'
          onClick={this._onSelect}
          style={{ width: `calc(100% - ${offset}px)` }}
          title={formatStoredPlaceName(location)}>
          <span
            className='place-text'>
            <Icon type={icon} /> {formatStoredPlaceName(location, false)}
          </span>
          <span
            className='place-detail'>
            {getDetailText(location)}
          </span>
        </Button>
        {showView &&
          <Button
            bsSize='xsmall'
            bsStyle='link'
            className='place-view'
            onClick={this._onView}
            style={{ width: `${BUTTON_WIDTH}px` }}
            title='View stop'><Icon type='search' /></Button>
        }
        {showForget &&
          <Button
            bsSize='xsmall'
            bsStyle='link'
            className='place-clear'
            onClick={this._onForget}
            style={{ width: `${BUTTON_WIDTH}px` }}>Clear</Button>
        }
      </li>
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
    return (
      <li className='place-item'>
        <Button
          bsStyle='link'
          onClick={this._onSelect}
          style={{
            overflow: 'hidden',
            padding: '5px 0 0 0',
            textAlign: 'left',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: `calc(100% - ${BUTTON_WIDTH}px)`
          }}
          title={`${name} (${moment(timestamp).fromNow()})`}>
          <span className='place-text'><Icon type='clock-o' /> {name} </span>
          <span className='place-detail'>{moment(timestamp).fromNow()}</span>
        </Button>
        <Button
          bsSize='xsmall'
          bsStyle='link'
          onClick={this._onForget}
          style={{ paddingTop: '6px', width: `${BUTTON_WIDTH}px` }}>Clear</Button>
      </li>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    currentPosition: state.otp.location.currentPosition,
    nearbyStops: state.otp.location.nearbyStops,
    query: state.otp.currentQuery,
    sessionSearches: state.otp.location.sessionSearches,
    stopsIndex: state.otp.transitIndex.stops,
    storageDisclaimer: state.otp.config.language.storageDisclaimer,
    user: state.otp.user
  }
}

const mapDispatchToProps = {
  forgetPlace,
  forgetSearch,
  forgetStop,
  setLocation,
  setQueryParam,
  setViewedStop,
  toggleTracking
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings)
