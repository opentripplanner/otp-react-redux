import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import Map from '../map/map'
import Icon from '../narrative/icon'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import {
  getActiveItineraries,
  getActiveSearch,
  getResponsesWithErrors
} from '../../util/state'

import MobileContainer from './container'
import ResultsError from './results-error'
import ResultsHeader from './results-header'

const StyledMobileContainer = styled(MobileContainer)`
  .options > .header {
    margin: 10px;
  }

  &.otp.mobile .mobile-narrative-container {
    bottom: 0;
    left: 0;
    overflow-y: auto;
    padding: 0;
    position: fixed;
    right: 0;
  }
`

const ExpandMapButton = styled(Button)`
  bottom: 10px;
  left: 10px;
  position: absolute;
  z-index: 999999;
`

const NARRATIVE_SPLIT_TOP_PERCENT = 45

/**
 * This component renders the mobile view of itinerary results from batch routing.
 */
class BatchMobileResultsScreen extends Component {
  state = {
    itineraryExpanded: false,
    mapExpanded: false
  }

  componentDidUpdate (prevProps) {
    if (this.props.activeLeg !== prevProps.activeLeg) {
      // Check if the active leg has changed. If a different leg is selected,
      // unexpand the itinerary to show the map focused on the selected leg
      // (similar to the behavior of LineItinerary).
      this._setItineraryExpanded(false)
    }
  }

  _setItineraryExpanded = itineraryExpanded => {
    this.setState({ itineraryExpanded })
  }

  _toggleMapExpanded = () => {
    this.setState({ mapExpanded: !this.state.mapExpanded })
  }

  render () {
    const { errors, itineraries } = this.props
    const hasNoResult = itineraries.length === 0 && errors.length > 0
    const { itineraryExpanded, mapExpanded } = this.state
    const narrativeTop = mapExpanded ? '100%' : (itineraryExpanded ? '100px' : `${NARRATIVE_SPLIT_TOP_PERCENT}%`)
    const mapBottom = mapExpanded ? 0 : `${100 - NARRATIVE_SPLIT_TOP_PERCENT}%`

    return (
      <StyledMobileContainer>
        <ResultsHeader />
        <div
          className='results-map'
          style={{bottom: mapBottom, display: itineraryExpanded ? 'none' : 'inherit'}}
        >
          <Map stateData={{ expanded: mapExpanded }} />
          <ExpandMapButton
            bsSize='small'
            onClick={this._toggleMapExpanded}
          >
            <Icon name={mapExpanded ? 'list-ul' : 'arrows-alt'} />{' '}
            {mapExpanded ? 'Show results' : 'Expand map'}
          </ExpandMapButton>
        </div>
        {hasNoResult
          ? <ResultsError error={errors[0]} />
          : (
            <div
              className='mobile-narrative-container'
              style={{top: narrativeTop, transition: 'top 300ms'}}
            >
              <NarrativeItineraries
                containerStyle={{
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%'
                }}
                onToggleDetailedItinerary={this._setItineraryExpanded}
              />
            </div>
          )
        }
      </StyledMobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    activeLeg: activeSearch ? activeSearch.activeLeg : null,
    errors: getResponsesWithErrors(state.otp),
    itineraries: getActiveItineraries(state.otp)
  }
}

export default connect(mapStateToProps)(BatchMobileResultsScreen)
