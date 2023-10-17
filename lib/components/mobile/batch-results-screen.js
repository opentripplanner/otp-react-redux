/* eslint-disable react/prop-types */
import { ArrowsAlt } from '@styled-icons/fa-solid/ArrowsAlt'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { ListUl } from '@styled-icons/fa-solid/ListUl'
import { useMap } from 'react-map-gl'
import coreUtils from '@opentripplanner/core-utils'
import React, { useEffect } from 'react'
import styled, { css } from 'styled-components'

import * as uiActions from '../../actions/ui'
import {
  getActiveItineraries,
  getActiveSearch,
  getResponsesWithErrors
} from '../../util/state'
import { getItineraryView, ItineraryView } from '../../util/ui'
import { IconWithText } from '../util/styledIcon'
import Map from '../map/map'
import NarrativeItineraries from '../narrative/narrative-itineraries'

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
  bottom: ${(props) =>
    props.expanded ? '0' : `${100 - NARRATIVE_SPLIT_TOP_PERCENT}%`};
  display: ${(props) => (props.visible ? 'inherit' : 'none')};
  left: 0;
  position: fixed;
  right: 0;
  top: 100px;
`

const narrativeCss = css`
  top: ${(props) =>
    props.visible
      ? props.expanded
        ? '100px'
        : `${NARRATIVE_SPLIT_TOP_PERCENT}%`
      : '100%'};
  transition: top 300ms;
`

const StyledResultsError = styled(ResultsError)`
  display: ${(props) => (props.visible ? 'inherit' : 'none')};
  ${narrativeCss}
`

const NarrativeContainer = styled.div`
  ${narrativeCss}
`

/**
 * This component renders the mobile view of itinerary results from batch routing,
 * and features a split view between the map and itinerary results or narratives.
 */
const BatchMobileResultsScreen = ({
  errors,
  itineraries,
  itineraryView,
  toggleBatchResultsMap
}) => {
  const hasErrorsAndNoResult = itineraries.length === 0 && errors.length > 0
  const mapExpanded =
    itineraryView === ItineraryView.LEG_HIDDEN ||
    itineraryView === ItineraryView.LIST_HIDDEN
  const itineraryExpanded = itineraryView === ItineraryView.FULL

  const { default: map } = useMap()
  // Trigger map resize when the map expanded variable changes.
  useEffect(() => {
    if (map) map.resize()
  }, [mapExpanded, map])

  return (
    <StyledMobileContainer>
      <ResultsHeader />
      <ResultsMap expanded={mapExpanded} visible={!itineraryExpanded}>
        <Map />
        <ExpandMapButton bsSize="small" onClick={toggleBatchResultsMap}>
          <IconWithText Icon={mapExpanded ? ListUl : ArrowsAlt}>
            {mapExpanded ? (
              <FormattedMessage id="components.BatchResultsScreen.showResults" />
            ) : (
              <FormattedMessage id="components.BatchResultsScreen.expandMap" />
            )}
          </IconWithText>
        </ExpandMapButton>
      </ResultsMap>
      {hasErrorsAndNoResult ? (
        <StyledResultsError
          error={errors[0]}
          expanded={itineraryExpanded}
          visible={!mapExpanded}
        />
      ) : (
        <NarrativeContainer
          className="mobile-narrative-container"
          expanded={itineraryExpanded}
          visible={!mapExpanded}
        >
          <NarrativeItineraries />
        </NarrativeContainer>
      )}
    </StyledMobileContainer>
  )
}

// connect to the redux store

const mapStateToProps = (state) => {
  const activeSearch = getActiveSearch(state)
  const urlParams = coreUtils.query.getUrlParams()
  return {
    activeLeg: activeSearch ? activeSearch.activeLeg : null,
    errors: getResponsesWithErrors(state),
    itineraries: getActiveItineraries(state),
    itineraryView: getItineraryView(urlParams) || state.otp.ui.itineraryView
  }
}

const mapDispatchToProps = {
  toggleBatchResultsMap: uiActions.toggleBatchResultsMap
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BatchMobileResultsScreen)
