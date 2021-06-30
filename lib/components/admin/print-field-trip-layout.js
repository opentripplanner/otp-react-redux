import PrintableItinerary from '@opentripplanner/printable-itinerary'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import TripDetails from '../narrative/connected-trip-details'
import { getTripFromRequest, lzwDecode } from '../../util/call-taker'
import { ComponentContext } from '../../util/contexts'
import { addPrintViewClassToRootHtml, clearClassFromRootHtml } from '../../util/print'
import { getTitle } from '../../util/state'

// Styles specific for rendering PrintFieldTripLayout.
const PrintLayout = styled.div`
  font-size: 16px;
  line-height: 115%;
  margin: 8px;
`

const Header = styled.div``

const TripTitle = styled.h1`
  border-bottom: 3px solid gray;
  font-size: 30px;
  font-weight: bold;
`

const TripInfoList = styled.ul`
  font-size: 16px;
  list-style: none;
  margin-top: 1em;
  padding: 0;
`

export const Val = styled.span`
  :empty:before {
    content: 'N/A';
  }
`

// The styles below mirror those found in OTP native client.
const TripContainer = styled.div`
  background: #ddd;
  margin-top: 1em;

  & > h2 {
    font-size: 20px;
    font-weight: bold;    
    margin: 0;
    padding: 4px;
  }
`

const TripBody = styled.div`
  padding: 8px;
`

const ItineraryContainer = styled.div`
  border: 3px solid #444;
  margin-top: .5em;

  & > h3 {
    background: #444;
    color: white;    
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    padding: 4px;
  }
`

const ItineraryBody = styled.div`
  background: white;
  padding: 12px;
`

const TripSummary = styled(TripDetails)`
  background: #eee;
  border: 1px solid #bbb;
  border-radius: 0;
  margin-top: 15px;
  padding: 5px;
`

/**
 * Component that renders the print version of field trip itineraries.
 */
class PrintFieldTripLayout extends Component {
  static contextType = ComponentContext

  _print = () => {
    window.print()
  }

  componentDidMount () {
    const { initializeModules, title } = this.props
    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    addPrintViewClassToRootHtml()

    // Set window title (appears in print headings)
    document.title = title

    // Load call-taker/field-trip functionality (performs a fetch).
    initializeModules()
  }

  componentDidUpdate (prevProps) {
    const { fetchFieldTripDetails, receivedFieldTrips, requestId, session } = this.props
    if (!prevProps.session && session) {
      // When session is set,
      // create a placeholder in the calltaker redux state that has just one request
      // for fetching/receiving the details of the field trip per request id.
      receivedFieldTrips({
        fieldTrips: [{
          endTime: 0,
          id: requestId
        }]
      })
      fetchFieldTripDetails(requestId)
    }
  }

  componentWillUnmount () {
    clearClassFromRootHtml()
  }

  render () {
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
          <Button bsSize='small' onClick={this._print} style={{ float: 'right' }}>
            <i className='fa fa-print' /> Print
          </Button>
          <TripTitle>Field Trip Plan: {schoolName} to {endLocation}</TripTitle>
        </Header>
        <TripInfoList>
          <li><b>Teacher</b>: <Val>{teacherName}</Val> ({schoolName}, Grade: <Val>{grade}</Val>)</li>
          <li><b>Teacher Address</b>: <Val>{address}</Val></li>
          <li><b>Phone</b>: <Val>{phoneNumber}</Val> / <b>Fax</b>: <Val>{faxNumber}</Val></li>
          <li><b>Email</b>: <Val>{emailAddress}</Val></li>
          <li><b>Students Age 7 and Over</b>: {numStudents || 0}</li>
          <li><b>Students Age 6 and Under</b>: {numFreeStudents || 0}</li>
          <li><b>Chaperones</b>: {numChaperones || 0}</li>
          {classpassId && <li><b>Class Pass Hop Card #</b>: {classpassId}</li>}
          <li><i>Request submitted: {timeStamp}</i></li>
        </TripInfoList>

        {tripStructure.map(({ title, trip, tripAbsentMessage }, i) => (
          <TripContainer key={i}>
            <h2>{title}</h2>
            {trip
              ? trip.groupItineraries?.map((groupItin, i) => {
                const itinerary = JSON.parse(lzwDecode(groupItin.itinData))
                return (
                  <TripBody key={i}>
                    <ItineraryContainer>
                      <h3>{groupItin.passengers} passengers on following itinerary:</h3>
                      <ItineraryBody>
                        <PrintableItinerary
                          config={config}
                          itinerary={itinerary}
                          LegIcon={LegIcon}
                        />
                        <TripSummary itinerary={itinerary} />
                      </ItineraryBody>
                    </ItineraryContainer>
                  </TripBody>
                )
              })
              : <TripBody><i>{tripAbsentMessage}</i></TripBody>
            }
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
  const request = requests.data.find(req => req.id === requestId)
  return {
    config: state.otp.config,
    request,
    requestId,
    session: state.callTaker.session,
    title: getTitle(state)
  }
}

const mapDispatchToProps = {
  fetchFieldTripDetails: fieldTripActions.fetchFieldTripDetails,
  initializeModules: callTakerActions.initializeModules,
  receivedFieldTrips: fieldTripActions.receivedFieldTrips
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintFieldTripLayout)
