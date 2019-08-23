import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { Button } from 'react-bootstrap'

import Icon from '../narrative/icon'
import { forgetSearch, toggleTracking } from '../../actions/api'
import { setQueryParam } from '../../actions/form'
import { forgetPlace, forgetStop, setLocation } from '../../actions/map'
import { setViewedStop } from '../../actions/ui'
import { getDetailText, formatStoredPlaceName, matchLatLon } from '../../util/map'
import { summarizeQuery } from '../../util/query'

const BUTTON_WIDTH = 40

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

  _getLocations = (user) => {
    const locations = [...user.locations]
    if (!locations.find(l => l.type === 'work')) {
      locations.push({
        id: 'work',
        type: 'work',
        icon: 'briefcase',
        name: 'click to add',
        blank: true
      })
    }
    if (!locations.find(l => l.type === 'home')) {
      locations.push({
        id: 'home',
        type: 'home',
        icon: 'home',
        name: 'click to add',
        blank: true
      })
    }
    return locations
  }

  render () {
    const { storageDisclaimer, user } = this.props
    const { favoriteStops, trackRecent, recentPlaces, recentSearches } = user
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
            onClick={this._enableTracking}
            className={trackRecent ? 'active' : ''}
            bsSize='xsmall'
            variant='link'>Yes</Button>
          <Button
            onClick={this._disableTracking}
            className={!trackRecent ? 'active' : ''}
            bsSize='xsmall'
            variant='link'>No</Button>
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
      if (!query.to && (!query.from || !matchLatLon(location, query.from))) setLocation({ type: 'to', location })
      // Vice versa for setting as 'from'.
      else if (!query.from && !matchLatLon(location, query.to)) setLocation({ type: 'from', location })
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
          variant='link'
          title={formatStoredPlaceName(location)}
          className='place-button'
          style={{ width: `calc(100% - ${offset}px)` }}
          onClick={this._onSelect}>
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
            onClick={this._onView}
            className='place-view'
            bsSize='xsmall'
            title='View stop'
            style={{ width: `${BUTTON_WIDTH}px` }}
            variant='link'><Icon type='search' /></Button>
        }
        {showForget &&
          <Button
            onClick={this._onForget}
            className='place-clear'
            bsSize='xsmall'
            style={{ width: `${BUTTON_WIDTH}px` }}
            variant='link'>Clear</Button>
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
          variant='link'
          title={`${name} (${moment(timestamp).fromNow()})`}
          style={{
            padding: '5px 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'left',
            width: `calc(100% - ${BUTTON_WIDTH}px)`
          }}
          onClick={this._onSelect}>
          <span className='place-text'><Icon type='clock-o' /> {name} </span>
          <span className='place-detail'>{moment(timestamp).fromNow()}</span>
        </Button>
        <Button
          onClick={this._onForget}
          bsSize='xsmall'
          style={{ paddingTop: '6px', width: `${BUTTON_WIDTH}px` }}
          variant='link'>Clear</Button>
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
  forgetStop,
  forgetPlace,
  forgetSearch,
  setLocation,
  setQueryParam,
  setViewedStop,
  toggleTracking
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings)
