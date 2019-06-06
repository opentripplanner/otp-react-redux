import React, { Component } from 'react'
import { connect } from 'react-redux'
// import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'

import Icon from '../narrative/icon'
import { forgetSearch, toggleTracking } from '../../actions/api'
import { setQueryParam } from '../../actions/form'
import { forgetPlace, setLocation } from '../../actions/map'

class UserSettings extends Component {
  _disableTracking = () => this.props.toggleTracking(false)

  _enableTracking = () => this.props.toggleTracking(true)

  render () {
    const { user } = this.props
    const { locations, trackRecent, recentSearches } = user
    console.log(this.props)
    const order = ['home', 'work', 'suggested', 'recent']
    const sortedLocations = locations.sort((a, b) => {
      const aIndex = order.indexOf(a.type)
      const bIndex = order.indexOf(b.type)
      if (aIndex > bIndex) return 1
      if (aIndex < bIndex) return -1
      else return 0
    })
    return (
      <div style={{
        paddingTop: '10px',
        paddingLeft: '5px',
        paddingRight: '5px',
        paddingBottom: '20px',
        margin: '10px 10px 0 10px',
        minHeight: '150px',
        backgroundColor: '#f0f0f0'
      }}>
        <div>My places</div>
        <ul style={{ padding: 0 }}>
          {sortedLocations.map(location => {
            return <Place key={location.id} location={location} {...this.props} />
          })}
        </ul>
        {trackRecent &&
          <div className='recent-searches-container'>
            <div>Recent searches</div>
            <ul style={{ padding: 0 }}>
              {recentSearches.length > 0
                ? recentSearches.map(search => {
                  return <RecentSearch key={search.id} search={search} {...this.props} />
                })
                : <small>No recent searches</small>
              }
            </ul>
          </div>
        }
        <hr style={{ borderTop: '1px solid #ccc' }} />
        <div>
          <div>My preferences</div>
          <small>Remember recent searches/places?</small>
          <Button
            onClick={this._enableTracking}
            style={trackRecent ? { backgroundColor: 'white' } : null}
            bsSize='xsmall'
            bsStyle='link'>Yes</Button>
          <Button
            onClick={this._disableTracking}
            style={!trackRecent ? { backgroundColor: 'white' } : null}
            bsSize='xsmall'
            bsStyle='link'>No</Button>
        </div>
      </div>
    )
  }
}

class Place extends Component {
  _onSelect = () => {
    const { location, query, setLocation } = this.props
    // console.log('selecting', this.props.id)
    if (!query.from) setLocation({ type: 'from', location })
    else if (!query.to) setLocation({ type: 'to', location })
  }

  _onForget = () => this.props.forgetPlace(this.props.location.id)

  render () {
    const { forgettable, icon, name } = this.props.location
    return (
      <li style={{ listStyle: 'none' }}>
        <Button
          bsStyle='link'
          title={name}
          style={{
            padding: '5px 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '275px'
          }}
          onClick={this._onSelect}>
          <span><Icon type={icon} /> {name}</span>
        </Button>
        <span className='pull-right'>
          {forgettable &&
            <Button
              onClick={this._onForget}
              bsSize='xsmall'
              style={{ paddingTop: '6px' }}
              bsStyle='link'>Clear</Button>
          }
        </span>
      </li>
    )
  }
}

class RecentSearch extends Component {
  _onSelect = () => {
    const { search, setQueryParam } = this.props
    setQueryParam(search.query)
  }

  _onForget = () => this.props.forgetSearch(this.props.search.id)

  render () {
    const { search } = this.props
    const { query } = search
    const name = `${query.mode} from ${query.from.name} to ${query.to.name}`
    return (
      <li style={{ listStyle: 'none' }}>
        <Button
          bsStyle='link'
          title={name}
          style={{
            padding: '5px 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '275px'
          }}
          onClick={this._onSelect}>
          <span><Icon type='clock-o' /> {name}</span>
        </Button>
        <span className='pull-right'>
          <Button
            onClick={this._onForget}
            bsSize='xsmall'
            style={{ paddingTop: '6px' }}
            bsStyle='link'>Clear</Button>
        </span>
      </li>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    user: state.otp.user,
    query: state.otp.currentQuery,
    currentPosition: state.otp.location.currentPosition,
    sessionSearches: state.otp.location.sessionSearches,
    nearbyStops: state.otp.location.nearbyStops,
    stopsIndex: state.otp.transitIndex.stops
  }
}

const mapDispatchToProps = {
  forgetPlace,
  forgetSearch,
  setLocation,
  setQueryParam,
  toggleTracking
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings)
