import LocationIcon from '@opentripplanner/location-icon'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as formActions from '../../actions/form'
import * as uiActions from '../../actions/ui'
import ErrorMessage from '../form/error-message'
import Map from '../map/map'
import {
  getActiveError,
  getActiveItineraries,
  getActiveSearch
} from '../../util/state'

import MobileNavigationBar from './navigation-bar'

const LocationContainer = styled.div`
  font-weight: 300;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const LocationSummaryContainer = styled.div`
  height: 50px;
  left: 0;
  padding-right: 10px;
  position: fixed;
  right: 0;
  top: 50px;
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

class ResultsHeaderAndError extends Component {
  static propTypes = {
    query: PropTypes.object,
    resultCount: PropTypes.number,
    setMobileScreen: PropTypes.func
  }

  _editSearchClicked = () => {
    this.props.clearActiveSearch()
    this.props.setMobileScreen(uiActions.MobileScreens.SEARCH_FORM)
  }

  render () {
    const { error, query, resultCount } = this.props
    const headerText = error
      ? 'No Trip Found'
      : (resultCount
        ? `We Found ${resultCount} Option${resultCount > 1 ? 's' : ''}`
        : 'Waiting...'
      )

    return (
      <>
        <MobileNavigationBar headerText={headerText} />

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

        {error && (
          <>
            <div className='results-error-map'><Map /></div>
            <div className='results-error-message'>
              <ErrorMessage error={error} />
              <div className='options-lower-tray mobile-padding'>
                <Button
                  className='back-to-search-button'
                  onClick={this._editSearchClicked}
                  style={{ width: '100%' }}
                >
                  <i className='fa fa-arrow-left' /> Back to Search
                </Button>
              </div>
            </div>
          </>
        )}
      </>
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
  clearActiveSearch: formActions.clearActiveSearch,
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultsHeaderAndError)
