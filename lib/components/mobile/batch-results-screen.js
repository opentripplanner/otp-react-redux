import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
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

// Styles for the results map also include prop-independent styles copied from mobile.css.
const ResultsMap = styled.div`
  bottom: ${props => props.expanded ? '0' : `${100 - NARRATIVE_SPLIT_TOP_PERCENT}%`};
  display: ${props => props.visible ? 'inherit' : 'none'};
  left: 0;
  position: fixed;
  right: 0;
  top: 100px;
`

const StyledResultsError = styled(ResultsError)`
  display: ${props => props.visible ? 'inherit' : 'none'};
  top: ${props => props.visible ? (props.expanded ? '100px' : `${NARRATIVE_SPLIT_TOP_PERCENT}%`) : '100%'};
  transition: top 300ms;
`

const VIEW = uiActions.ItineraryView

/**
 * This component renders the mobile view of itinerary results from batch routing,
 * and features a split view between the map and itinerary results or narratives.
 */
class BatchMobileResultsScreen extends Component {
  state = {
    previousItineraryView: null
  }

  _setItineraryView = view => {
    this.setState({ previousItineraryView: this.props.itineraryView })
    this.props.setItineraryView(view)
  }

  _toggleMapExpanded = () => {
    this._setItineraryView(this.props.itineraryView === VIEW.HIDDEN ? this.state.previousItineraryView : VIEW.HIDDEN)
  }

  render () {
    const { errors, itineraries, itineraryView } = this.props
    const hasNoResult = itineraries.length === 0 && errors.length > 0
    const mapExpanded = itineraryView === VIEW.HIDDEN
    const itineraryExpanded = itineraryView === VIEW.FULL
    const narrativeTop = mapExpanded ? '100%' : (itineraryExpanded ? '100px' : `${NARRATIVE_SPLIT_TOP_PERCENT}%`)

    return (
      <StyledMobileContainer>
        <ResultsHeader />
        <ResultsMap
          expanded={mapExpanded}
          visible={!itineraryExpanded}
        >
          <Map />
          <ExpandMapButton
            bsSize='small'
            onClick={this._toggleMapExpanded}
          >
            <Icon name={mapExpanded ? 'list-ul' : 'arrows-alt'} />{' '}
            {mapExpanded ? 'Show results' : 'Expand map'}
          </ExpandMapButton>
        </ResultsMap>
        {hasNoResult
          ? <StyledResultsError
            error={errors[0]}
            expanded={itineraryExpanded}
            visible={!mapExpanded}
          />
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
  const urlParams = coreUtils.query.getUrlParams()

  return {
    activeLeg: activeSearch ? activeSearch.activeLeg : null,
    errors: getResponsesWithErrors(state.otp),
    itineraries: getActiveItineraries(state.otp),
    itineraryView: urlParams.ui_itineraryView || VIEW.DEFAULT
  }
}

const mapDispatchToProps = {
  setItineraryView: uiActions.setItineraryView
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchMobileResultsScreen)
