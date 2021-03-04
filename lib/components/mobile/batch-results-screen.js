import coreUtils from '@opentripplanner/core-utils'
import LocationIcon from '@opentripplanner/location-icon'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import Map from '../map/map'
import ErrorMessage from '../form/error-message'
import Icon from '../narrative/icon'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { clearActiveSearch } from '../../actions/form'
import { MobileScreens, setMobileScreen } from '../../actions/ui'
import {
  getActiveError,
  getActiveItineraries,
  getActiveSearch
} from '../../util/state'

import MobileNavigationBar from './navigation-bar'
import MobileContainer from './container'

const StyledMobileContainer = styled(MobileContainer)`
  bottom: 0;
  display: flex;
  flex-direction: column;
  left: 0;
  padding-top: 50px;
  position: fixed;
  right: 0;
  top: 0;

  .options > .header {
    margin: 10px;
  }
`

const LocationContainer = styled.div`
  font-weight: 300;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const LocationSummaryContainer = styled.div`
  height: 50px;
  padding-right: 10px;
`

const LocationsSummaryColFromTo = styled(Col)`
  font-size: 1.1em;
  line-height: 1.2em;
`

const LocationsSummaryRow = styled(Row)`
  padding: 4px 8px;
`

const StyledLocationIcon = styled(LocationIcon)`
  margin: 3px;
`

const ResultsMap = styled.div`
  flex-grow: 1;
  position: unset;
`

const MapContainer = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`

const ExpandMapButton = styled(Button)`
  bottom: 25px;
  position: absolute;
  right: 10px;
  z-index: 999999;
`

class BatchMobileResultsScreen extends Component {
  static propTypes = {
    query: PropTypes.object,
    resultCount: PropTypes.number,
    setMobileScreen: PropTypes.func
  }

  constructor () {
    super()
    this.state = {
      itineraryExpanded: false,
      mapExpanded: false
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
      this._setItineraryExpanded(false)
    }
  }

  _setItineraryExpanded = itineraryExpanded => {
    this.setState({ itineraryExpanded })
  }

  _editSearchClicked = () => {
    this.props.clearActiveSearch()
    this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
  }

  _toggleMapExpanded = () => {
    this.setState({ mapExpanded: !this.state.mapExpanded })
  }

  renderError = () => {
    const { error } = this.props

    return (
      <MobileContainer>
        <MobileNavigationBar headerText='No Trip Found' />
        {this.renderLocationsSummary()}
        <div className='results-error-map'><Map /></div>
        <div className='results-error-message'>
          <ErrorMessage error={error} />
          <div className='options-lower-tray mobile-padding'>
            <Button className='back-to-search-button' onClick={this._editSearchClicked} style={{ width: '100%' }}>
              <i className='fa fa-arrow-left' /> Back to Search
            </Button>
          </div>
        </div>
      </MobileContainer>
    )
  }

  renderLocationsSummary = () => {
    const { query } = this.props

    return (
      <LocationSummaryContainer>
        <LocationsSummaryRow className='locations-summary'>
          <LocationsSummaryColFromTo sm={11} xs={8}>
            <LocationContainer>
              <StyledLocationIcon type='from' /> { query.from ? query.from.name : '' }
            </LocationContainer>
            <LocationContainer style={{ marginTop: 2 }}>
              <StyledLocationIcon type='to' /> { query.to ? query.to.name : '' }
            </LocationContainer>
          </LocationsSummaryColFromTo>
          <Col sm={1} xs={4}>
            <Button
              className='edit-search-button pull-right'
              onClick={this._editSearchClicked}
            >Edit</Button>
          </Col>
        </LocationsSummaryRow>
      </LocationSummaryContainer>
    )
  }

  renderMap () {
    const { mapExpanded } = this.state
    return (
      <ResultsMap>
        {/* Extra container for positioning the expand map button relative to the map.
            (ResultsMap above has position =)
          */}
        <MapContainer>
          <Map />
          <ExpandMapButton
            bsSize='small'
            onClick={this._toggleMapExpanded}
          >
            <Icon name={mapExpanded ? 'list-ul' : 'arrows-alt'} />
            {mapExpanded ? 'Show results' : 'Expand map'}
          </ExpandMapButton>
        </MapContainer>
      </ResultsMap>
    )
  }

  render () {
    const {
      error,
      resultCount
    } = this.props
    const { itineraryExpanded, mapExpanded } = this.state

    const narrativeContainerStyle = itineraryExpanded
      ? { flexGrow: 1, overflowY: 'auto', padding: 0, position: 'unset' }
      : { flex: '0 0 60%', overflowY: 'auto', padding: 0, position: 'unset' }

    // Ensure that narrative covers map.
    narrativeContainerStyle.backgroundColor = 'white'

    if (error) {
      return this.renderError()
    }

    return (
      <StyledMobileContainer>
        <MobileNavigationBar
          headerText={resultCount
            ? `We Found ${resultCount} Option${resultCount > 1 ? 's' : ''}`
            : 'Waiting...'
          }
        />

        {this.renderLocationsSummary()}

        {mapExpanded
          // Set up two separate renderings of the map according to map expanded state,
          // so that it is properly sized and itineraries fit under either conditions.
          // (Otherwise, if just the narrative is added/removed, the map doesn't resize properly.)
          ? this.renderMap()
          : (
            <>
              {!itineraryExpanded && this.renderMap()}
              <div
                className='mobile-narrative-container'
                ref='narrative-container'
                style={narrativeContainerStyle}
              >
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
          )}
      </StyledMobileContainer>
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

  const itineraries = getActiveItineraries(state.otp)
  return {
    error: getActiveError(state.otp),
    query: state.otp.currentQuery,
    resultCount:
      response
        ? activeSearch.query.routingType === 'ITINERARY'
          ? itineraries.length
          : response.otp.profile.length
        : null
  }
}

const mapDispatchToProps = {
  clearActiveSearch,
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchMobileResultsScreen)
