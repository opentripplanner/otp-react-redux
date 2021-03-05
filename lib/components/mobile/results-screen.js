import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as narrativeActions from '../../actions/narrative'
import Map from '../map/map'
import ItineraryCarousel from '../narrative/itinerary-carousel'
import {
  getActiveError,
  getActiveItineraries,
  getActiveSearch,
  getRealtimeEffects
} from '../../util/state'

import MobileContainer from './container'
import ResultsHeaderAndError from './results-header-and-error'

class MobileResultsScreen extends Component {
  static propTypes = {
    activeItineraryIndex: PropTypes.number,
    activeLeg: PropTypes.number,
    error: PropTypes.object,
    query: PropTypes.object,
    realtimeEffects: PropTypes.object,
    resultCount: PropTypes.number,
    useRealtime: PropTypes.bool
  }

  constructor () {
    super()
    this.state = {
      expanded: false
    }
  }

  componentDidMount () {
    // Get the target element that we want to persist scrolling for
    // FIXME Do we need to add something that removes the listeners when
    // component unmounts?
    coreUtils.ui.enableScrollForSelector('.mobile-narrative-container')
  }

  componentDidUpdate (prevProps) {
    // Check if the active leg changed
    if (this.props.activeLeg !== prevProps.activeLeg) {
      this._setExpanded(false)
    }
  }

  _setExpanded (expanded) {
    this.setState({ expanded })
    this.refs['narrative-container'].scrollTop = 0
  }

  _optionClicked = () => {
    this._setExpanded(!this.state.expanded)
  }

  _toggleRealtime = () => this.props.setUseRealtimeResponse(
    {useRealtime: !this.props.useRealtime}
  )

  renderDots = () => {
    const { activeItineraryIndex, resultCount } = this.props

    // Construct the 'dots'
    const dots = []
    for (let i = 0; i < resultCount; i++) {
      dots.push(
        <div
          className={`dot${activeItineraryIndex === i ? ' active' : ''}`}
          key={i}
        />
      )
    }

    return (
      <div className='dots-container' style={{ padding: 'none' }}>{dots}</div>
    )
  }

  render () {
    const {
      activeItineraryIndex,
      error,
      realtimeEffects,
      useRealtime
    } = this.props
    const { expanded } = this.state

    const narrativeContainerStyle = expanded
      ? { top: 140, overflowY: 'auto' }
      : { height: 80, overflowY: 'hidden' }

    // Ensure that narrative covers map.
    narrativeContainerStyle.backgroundColor = 'white'

    const showRealtimeAnnotation = realtimeEffects.isAffectedByRealtimeData && (
      realtimeEffects.exceedsThreshold ||
      realtimeEffects.routesDiffer ||
      !useRealtime
    )

    return (
      <MobileContainer>
        <ResultsHeaderAndError />
        {!error && (
        <>
          <div className='results-map'>
            <Map />
          </div>

          <div
            className='mobile-narrative-header'
            onClick={this._optionClicked}
            style={{ bottom: expanded ? null : 100, top: expanded ? 100 : null }}
          >
            Option {activeItineraryIndex + 1}
            <i className={`fa fa-caret-${expanded ? 'down' : 'up'}`} style={{ marginLeft: 8 }} />
          </div>

          <div
            className='mobile-narrative-container'
            ref='narrative-container'
            style={narrativeContainerStyle}
          >
            <ItineraryCarousel
              expanded={this.state.expanded}
              hideHeader
              onClick={this._optionClicked}
              showRealtimeAnnotation={showRealtimeAnnotation}
            />
          </div>
          {this.renderDots()}
        </>
        )}
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const {useRealtime} = state.otp
  const response = !activeSearch
    ? null
    : useRealtime ? activeSearch.response : activeSearch.nonRealtimeResponse

  const realtimeEffects = getRealtimeEffects(state.otp)
  const itineraries = getActiveItineraries(state.otp)
  return {
    activeItineraryIndex: activeSearch ? activeSearch.activeItinerary : null,
    activeLeg: activeSearch ? activeSearch.activeLeg : null,
    error: getActiveError(state.otp),
    query: state.otp.currentQuery,
    realtimeEffects,
    resultCount:
      response
        ? activeSearch.query.routingType === 'ITINERARY'
          ? itineraries.length
          : response.otp.profile.length
        : null,
    useRealtime
  }
}

const mapDispatchToProps = {
  setUseRealtimeResponse: narrativeActions.setUseRealtimeResponse
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileResultsScreen)
