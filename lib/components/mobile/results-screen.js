import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import {
  getActiveError,
  getActiveItineraries,
  getActiveSearch,
  getRealtimeEffects
} from '../../util/state'
import ItineraryCarousel from '../narrative/itinerary-carousel'
import Map from '../map/map'

import MobileContainer from './container'
import ResultsError from './results-error'
import ResultsHeader from './results-header'

const OptionExpander = styled.button`
  border: none;
  bottom: ${(props) => (props.expanded ? 'inherit' : '100px')};
  outline: none;
  padding-bottom: 3px;
  display: block;
  top: ${(props) => (props.expanded ? '100px' : 'inherit')};
  width: 100%;
`

const NarrativeContainer = styled.div`
  background-color: white;
  ${(props) =>
    props.expanded
      ? 'top: 140px; overflow-y: auto;'
      : 'height: 80px; overflow-y: hidden;'}
`

class MobileResultsScreen extends Component {
  static propTypes = {
    activeItineraryIndex: PropTypes.number,
    activeLeg: PropTypes.number,
    error: PropTypes.object,
    query: PropTypes.object,
    realtimeEffects: PropTypes.object,
    resultCount: PropTypes.number
  }

  constructor() {
    super()
    this.state = {
      expanded: false
    }
  }

  componentDidMount() {
    // Get the target element that we want to persist scrolling for
    // FIXME Do we need to add something that removes the listeners when
    // component unmounts?
    coreUtils.ui.enableScrollForSelector('.mobile-narrative-container')
  }

  componentDidUpdate(prevProps) {
    // Check if the active leg changed
    if (this.props.activeLeg !== prevProps.activeLeg) {
      this._setExpanded(false)
    }
  }

  _setExpanded(expanded) {
    this.setState({ expanded })
    // Typescript TODO: move to typescript/modern react (hooks)
    // eslint-disable-next-line react/no-string-refs
    this.refs['narrative-container'].scrollTop = 0
  }

  _optionClicked = () => {
    this._setExpanded(!this.state.expanded)
  }

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
      <div className="dots-container" style={{ padding: 'none' }}>
        {dots}
      </div>
    )
  }

  render() {
    const { activeItineraryIndex, error, realtimeEffects } = this.props
    const { expanded } = this.state

    const showRealtimeAnnotation =
      realtimeEffects.isAffectedByRealtimeData &&
      (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer)

    return (
      <MobileContainer>
        <ResultsHeader />
        <div className={error ? 'results-error-map' : 'results-map'}>
          <Map />
        </div>
        {error ? (
          <ResultsError error={error} />
        ) : (
          <>
            <OptionExpander
              className="mobile-narrative-header"
              expanded={expanded}
              onClick={this._optionClicked}
            >
              <FormattedMessage
                id="components.ResultsScreen.header"
                values={{ index: activeItineraryIndex + 1 }}
              />
              <i
                className={`fa fa-caret-${expanded ? 'down' : 'up'}`}
                style={{ marginLeft: 8 }}
              />
            </OptionExpander>

            <NarrativeContainer
              className="mobile-narrative-container"
              expanded={expanded}
              // Typescript TODO: See previous note
              // eslint-disable-next-line react/no-string-refs
              ref="narrative-container"
            >
              <ItineraryCarousel
                expanded={this.state.expanded}
                hideHeader
                onClick={this._optionClicked}
                showRealtimeAnnotation={showRealtimeAnnotation}
              />
            </NarrativeContainer>
            {this.renderDots()}
          </>
        )}
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state)
  const response = activeSearch?.response

  const realtimeEffects = getRealtimeEffects(state)
  const itineraries = getActiveItineraries(state)
  return {
    activeItineraryIndex: activeSearch ? activeSearch.activeItinerary : null,
    activeLeg: activeSearch ? activeSearch.activeLeg : null,
    error: getActiveError(state),
    query: state.otp.currentQuery,
    realtimeEffects,
    resultCount: response
      ? activeSearch.query.routingType === 'ITINERARY'
        ? itineraries.length
        : response.otp.profile.length
      : null
  }
}

export default connect(mapStateToProps, {})(MobileResultsScreen)
