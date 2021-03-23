import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import Map from '../map/map'
import Icon from '../narrative/icon'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { getActiveError, getActiveSearch } from '../../util/state'

import MobileContainer from './container'
import ResultsHeaderAndError from './results-header-and-error'

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

/**
 * This component renders the mobile view of itinerary results from batch routing.
 */
class BatchMobileResultsScreen extends Component {
  static propTypes = {
    error: PropTypes.object
  }

  constructor () {
    super()
    this.state = {
      itineraryExpanded: false,
      mapExpanded: false
    }
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

  renderMap () {
    const { mapExpanded } = this.state
    return (
      <div className='results-map' style={{bottom: mapExpanded ? 0 : '60%'}}>
        <Map />
        <ExpandMapButton
          bsSize='small'
          onClick={this._toggleMapExpanded}
        >
          <Icon name={mapExpanded ? 'list-ul' : 'arrows-alt'} />{' '}
          {mapExpanded ? 'Show results' : 'Expand map'}
        </ExpandMapButton>
      </div>
    )
  }

  render () {
    const { error } = this.props
    const { itineraryExpanded, mapExpanded } = this.state

    return (
      <StyledMobileContainer>
        <ResultsHeaderAndError />
        {!error && (mapExpanded
          // Set up two separate renderings of the map according to mapExpanded,
          // so that the map is properly sized and itineraries fit under either conditions.
          // (Otherwise, if just the narrative is added/removed, the map doesn't resize properly.)
          ? this.renderMap()
          : (
            <>
              {!itineraryExpanded && this.renderMap()}
              <div className='mobile-narrative-container' style={{top: itineraryExpanded ? '100px' : '40%'}}>
                <NarrativeItineraries
                  containerStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%'
                  }}
                  onToggleDetailedItinerary={this._setItineraryExpanded}
                />
              </div>
            </>
          ))
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
    error: getActiveError(state.otp)
  }
}

export default connect(mapStateToProps)(BatchMobileResultsScreen)
