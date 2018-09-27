import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import DefaultMap from '../map/default-map'
import ErrorMessage from '../form/error-message'
import ItineraryCarousel from '../narrative/itinerary-carousel'
import RealtimeAnnotation from '../narrative/realtime-annotation'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

import { MobileScreens, setMobileScreen } from '../../actions/ui'
import { setUseRealtimeResponse } from '../../actions/narrative'
import { getActiveSearch, getRealtimeEffects } from '../../util/state'

class MobileResultsScreen extends Component {
  static propTypes = {
    map: PropTypes.element,
    query: PropTypes.object,
    resultCount: PropTypes.number,

    setMobileScreen: PropTypes.func
  }

  constructor () {
    super()
    this.state = {
      expanded: false
    }
  }

  _editSearchClicked = () => {
    this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
  }

  _optionClicked = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  _toggleRealtime = () => this.props.setUseRealtimeResponse({useRealtime: !this.props.useRealtime})

  render () {
    const { error, itineraryClass, query, realtimeEffects, resultCount, useRealtime } = this.props

    const narrativeContainerStyle = this.state.expanded
      ? {
        top: 100,
        overflowY: 'auto'
      } : {
        height: 120,
        overflowY: 'hidden'
      }
    // Ensure that narrative covers map.
    narrativeContainerStyle.backgroundColor = 'white'

    const headerAction = realtimeEffects.isAffectedByRealtimeData &&
      (realtimeEffects.exceedsThreshold ||
        realtimeEffects.routesDiffer ||
        !useRealtime) && (
        <RealtimeAnnotation
          componentClass='popover'
          toggleRealtime={this._toggleRealtime}
          realtimeEffects={realtimeEffects}
          useRealtime={useRealtime}
        />
      )

    const locationsSummary = (
      <div className='locations-summary' style={{ padding: '4px 8px' }}>
        <div style={{ float: 'right' }}>
          <Button
            className='edit-search-button'
            onClick={this._editSearchClicked}
          >Edit</Button>
        </div>
        <div style={{ fontSize: '15px', lineHeight: '19px' }}>
          <div className='location'>
            <i className='fa fa-star' /> { query.from ? query.from.name : '' }
          </div>
          <div className='location' style={{ marginTop: '2px' }}>
            <i className='fa fa-map-marker' /> { query.to ? query.to.name : '' }
          </div>
        </div>
      </div>
    )

    if (error) {
      return (
        <MobileContainer>
          <MobileNavigationBar headerText='No Trip Found' />
          {locationsSummary}
          <div className='results-error-map'><DefaultMap /></div>
          <div className='results-error-message'>
            <ErrorMessage error={error} />
            <div className='options-lower-tray mobile-padding'>
              <Button className='back-to-search-button' onClick={this._editSearchClicked} style={{ width: '100%' }}>
                <i className='fa fa-arrow-left' /> Back to Search
              </Button>
            </div>
          </div>

          <ErrorMessage error={error} />
        </MobileContainer>
      )
    }

    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={resultCount
            ? `We Found ${resultCount} Option${resultCount > 1 ? 's' : ''}`
            : 'Waiting...'
          }
          headerAction={headerAction}
        />
        {locationsSummary}

        <div className='results-map'>
          {this.props.map}
        </div>

        <div className='mobile-narrative-container' style={narrativeContainerStyle}>
          <ItineraryCarousel
            itineraryClass={itineraryClass}
            hideHeader
            expanded={this.state.expanded}
            onClick={this._optionClicked}
          />
        </div>
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

  return {
    query: state.otp.currentQuery,
    realtimeEffects,
    error: response && response.error,
    resultCount:
      response
        ? activeSearch.query.routingType === 'ITINERARY'
          ? response.plan
            ? response.plan.itineraries.length
            : 0
          : response.otp.profile.length
        : null,
    useRealtime
  }
}

const mapDispatchToProps = {
  setMobileScreen,
  setUseRealtimeResponse
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileResultsScreen)
