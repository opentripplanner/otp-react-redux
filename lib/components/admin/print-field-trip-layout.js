/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { Print } from '@styled-icons/fa-solid/Print'
import PrintableItinerary from '@opentripplanner/printable-itinerary'
import React, { Component } from 'react'

import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import {
  addPrintViewClassToRootHtml,
  clearClassFromRootHtml
} from '../../util/print'
import { ComponentContext } from '../../util/contexts'
import { getTripFromRequest, lzwDecode } from '../../util/call-taker'
import { IconWithText } from '../util/styledIcon'

import {
  Header,
  ItineraryContainer,
  PrintableItineraryContainer,
  PrintLayout,
  TripBody,
  TripContainer,
  TripInfoList,
  TripSummary,
  TripTitle,
  Val
} from './print-styled'

/**
 * Component that renders the print version of field trip itineraries.
 */
class PrintFieldTripLayout extends Component {
  static contextType = ComponentContext

  _print = () => {
    window.print()
  }

  componentDidMount() {
    const { initializeModules, intl } = this.props
    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    addPrintViewClassToRootHtml()

    // Load call-taker/field-trip functionality (performs a fetch).
    initializeModules(intl)
  }

  componentDidUpdate(prevProps) {
    const {
      fetchFieldTripDetails,
      intl,
      receivedFieldTrips,
      request,
      requestId,
      session
    } = this.props
    if (!prevProps.session && session) {
      // When session is set,
      // create a placeholder in the calltaker redux state that has just one request
      // for fetching/receiving the details of the field trip per request id.
      receivedFieldTrips({
        fieldTrips: [
          {
            endTime: 0,
            id: requestId
          }
        ]
      })
      fetchFieldTripDetails(requestId, intl)
    }

    if (request && request !== prevProps.request) {
      // Set window title when request has fully loaded
      // (appears in print headings)
      const { endLocation, schoolName } = request
      document.title = `Field Trip: ${schoolName} to ${endLocation}`
    }
  }

  componentWillUnmount() {
    clearClassFromRootHtml()
  }

  render() {
    const { config, request } = this.props
    const { LegIcon } = this.context
    if (!request) return null

    const {
      address,
      classpassId,
      emailAddress,
      endLocation,
      faxNumber,
      grade,
      numChaperones,
      numFreeStudents,
      numStudents,
      phoneNumber,
      schoolName,
      teacherName,
      timeStamp
    } = request

    // Outbound/inbound template
    const tripStructure = [
      {
        title: 'Outbound Trip (to Destination)',
        trip: getTripFromRequest(request, true),
        tripAbsentMessage: 'No Outbound Trip Planned'
      },
      {
        title: 'Inbound Trip (from Destination)',
        trip: getTripFromRequest(request, false),
        tripAbsentMessage: 'No Inbound Trip Planned'
      }
    ]

    return (
      <PrintLayout>
        <Header>
          <Button
            bsSize="small"
            onClick={this._print}
            style={{ float: 'right' }}
          >
            <IconWithText Icon={Print}>Print</IconWithText>
          </Button>
          <TripTitle>
            Field Trip Plan: {schoolName} to {endLocation}
          </TripTitle>
        </Header>
        <TripInfoList>
          <li>
            <b>Teacher</b>: <Val>{teacherName}</Val> ({schoolName}, Grade:{' '}
            <Val>{grade}</Val>)
          </li>
          <li>
            <b>Teacher Address</b>: <Val>{address}</Val>
          </li>
          <li>
            <b>Phone</b>: <Val>{phoneNumber}</Val> / <b>Fax</b>:{' '}
            <Val>{faxNumber}</Val>
          </li>
          <li>
            <b>Email</b>: <Val>{emailAddress}</Val>
          </li>
          <li>
            <b>Students Age 7 and Over</b>: {numStudents || 0}
          </li>
          <li>
            <b>Students Age 6 and Under</b>: {numFreeStudents || 0}
          </li>
          <li>
            <b>Chaperones</b>: {numChaperones || 0}
          </li>
          {classpassId && (
            <li>
              <b>Class Pass Hop Card #</b>: {classpassId}
            </li>
          )}
          <li>
            <i>Request submitted: {timeStamp}</i>
          </li>
        </TripInfoList>

        {tripStructure.map(({ title, trip, tripAbsentMessage }, i) => (
          <TripContainer key={i}>
            <h2>{title}</h2>
            {trip ? (
              trip.groupItineraries?.map((groupItin, i) => {
                const itinerary = JSON.parse(lzwDecode(groupItin.itinData))
                return (
                  <TripBody key={i}>
                    <ItineraryContainer>
                      <h3>
                        {groupItin.passengers} passengers on following
                        itinerary:
                      </h3>
                      <PrintableItineraryContainer>
                        <PrintableItinerary
                          config={config}
                          itinerary={itinerary}
                          LegIcon={LegIcon}
                        />
                        <TripSummary itinerary={itinerary} />
                      </PrintableItineraryContainer>
                    </ItineraryContainer>
                  </TripBody>
                )
              })
            ) : (
              <TripBody>
                <i>{tripAbsentMessage}</i>
              </TripBody>
            )}
          </TripContainer>
        ))}
      </PrintLayout>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const requestId = parseInt(state.router.location.query.requestId)
  const { requests } = state.callTaker.fieldTrip
  const request = requests.data.find((req) => req.id === requestId)
  return {
    config: state.otp.config,
    request,
    requestId,
    session: state.callTaker.session
  }
}

const mapDispatchToProps = {
  fetchFieldTripDetails: fieldTripActions.fetchFieldTripDetails,
  initializeModules: callTakerActions.initializeModules,
  receivedFieldTrips: fieldTripActions.receivedFieldTrips
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PrintFieldTripLayout))
