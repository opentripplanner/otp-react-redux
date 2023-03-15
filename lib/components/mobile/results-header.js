import { Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import LocationIcon from '@opentripplanner/location-icon'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import {
  getActiveItineraries,
  getActiveSearch,
  getResponsesWithErrors
} from '../../util/state'

import EditSearchButton from './edit-search-button'
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

/**
 * This component renders the results header and an error message
 * if no itinerary was found.
 */
class ResultsHeader extends Component {
  static propTypes = {
    errors: PropTypes.array,
    intl: PropTypes.object,
    query: PropTypes.object,
    resultCount: PropTypes.number
  }

  render() {
    const { errors, intl, query, resultCount } = this.props
    const hasNoResult = resultCount === 0 && errors.length > 0
    const headerText = hasNoResult
      ? intl.formatMessage({ id: 'components.ResultsHeader.noTripFound' })
      : resultCount
      ? intl.formatMessage(
          { id: 'components.ResultsHeader.tripsFound' },
          { count: resultCount }
        )
      : intl.formatMessage({ id: 'components.ResultsHeader.waiting' })

    return (
      <>
        <MobileNavigationBar headerText={headerText} />

        <LocationSummaryContainer>
          <LocationsSummaryRow className="locations-summary">
            <LocationsSummaryColFromTo sm={11} xs={8}>
              <LocationContainer>
                <StyledLocationIcon type="from" />{' '}
                {query.from ? query.from.name : ''}
              </LocationContainer>
              <LocationContainer style={{ marginTop: 2 }}>
                <StyledLocationIcon type="to" /> {query.to ? query.to.name : ''}
              </LocationContainer>
            </LocationsSummaryColFromTo>
            <Col sm={1} xs={4}>
              <EditSearchButton className="edit-search-button pull-right">
                <FormattedMessage id="common.forms.edit" />
              </EditSearchButton>
            </Col>
          </LocationsSummaryRow>
        </LocationSummaryContainer>
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  const activeSearch = getActiveSearch(state)
  const response = activeSearch?.response

  const itineraries = getActiveItineraries(state)
  return {
    errors: getResponsesWithErrors(state),
    query: state.otp.currentQuery,
    resultCount: response ? itineraries.length : null
  }
}

export default connect(mapStateToProps)(injectIntl(ResultsHeader))
