// import PrintableItinerary from '@opentripplanner/printable-itinerary'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import DefaultMap from '../map/default-map'
// import TripDetails from '../narrative/connected-trip-details'
// import { getTripFromRequest } from '../../util/call-taker'
import { ComponentContext } from '../../util/contexts'

import {
  Val
} from './styled'

class PrintFieldTripLayout extends Component {
  static contextType = ComponentContext

  constructor (props) {
    super(props)
    this.state = {
      mapVisible: true
    }
  }

  _toggleMap = () => {
    this.setState({ mapVisible: !this.state.mapVisible })
  }

  _print = () => {
    window.print()
  }

  componentDidMount () {
    const { initializeModules } = this.props
    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    const root = document.getElementsByTagName('html')[0]
    root.setAttribute('class', 'print-view')

    // Load call-taker/field-trip functionality (performs a fetch).
    initializeModules()
  }

  async componentDidUpdate (prevProps) {
    const { fetchFieldTrips, fetchFieldTripDetails, requestId, session } = this.props
    if (!prevProps.session && session) {
      // When session is set
      // Load all field trips
      await fetchFieldTrips()
      // Load details for field trip per request id.
      fetchFieldTripDetails(requestId)
    }
  }

  /**
   * Remove class attribute from html tag on clean up.
   */
  componentWillUnmount () {
    const root = document.getElementsByTagName('html')[0]
    root.removeAttribute('class')
  }

  render () {
    const { request } = this.props
    // const { LegIcon } = this.context
    if (!request) return null

    const {
      address,
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

    // const outboundTrip = getTripFromRequest(request, true)
    // const inboundTrip = getTripFromRequest(request, false)

    return (
      <div className='otp print-layout'>
        {/* The header bar, including the Toggle Map and Print buttons */}
        <div className='header'>
          <div style={{ float: 'right' }}>
            <Button bsSize='small' onClick={this._toggleMap}>
              <i className='fa fa-map' /> Toggle Map
            </Button>
            {' '}
            <Button bsSize='small' onClick={this._print}>
              <i className='fa fa-print' /> Print
            </Button>
          </div>
          <h1>Field Trip Plan: {schoolName} to {endLocation}</h1>
        </div>
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><b>Teacher</b>: <Val>{teacherName}</Val> ({schoolName}, Grade: <Val>{grade}</Val>)</li>
            <li><b>Teacher Address</b>: <Val>{address}</Val></li>
            <li><b>Phone</b>: <Val>{phoneNumber}</Val> / Fax: <Val>{faxNumber}</Val></li>
            <li><b>Email</b>: <Val>{emailAddress}</Val></li>
            <li><b>Students Age 7 and Over</b>: {numStudents || 0}</li>
            <li><b>Students Age 6 and Under</b>: {numFreeStudents || 0}</li>
            <li><b>Chaperones</b>: {numChaperones || 0}</li>
            <li><i>Request submitted: {timeStamp}</i></li>
          </ul>
        </div>

        <div>
          <h2>Outbound Trip (to Destination)</h2>
          <p><i>No Outbound Trip Planned</i></p>
          {/* outboundTrip
            ? outboundTrip.groupItineraries?.map((groupItin, i) => {
              //const itinerary = JSON.parse(groupItin.itinData)
              return (
                <div key={i}>
                  <PrintableItinerary
                    config={config}
                    //itinerary={itinerary}
                    LegIcon={LegIcon}
                  />
                  <TripDetails itinerary={itinerary} />
                </div>
              )
            })
            : <p><i>No Outbound Trip Planned</i></p>
          */}
        </div>
        <div>
          <h2>Inbound Trip (to Destination)</h2>
          <p><i>No Inbound Trip Planned</i></p>
        </div>

        {/* The map, if visible */}
        {this.state.mapVisible &&
          <div className='map-container'>
            <DefaultMap />
          </div>
        }
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const requestId = parseInt(state.router.location.query.requestId)
  const { requests } = state.callTaker.fieldTrip
  const request = requests.data.find(req => req.id === requestId)
  return {
    request,
    requestId,
    session: state.callTaker.session
  }
}

const mapDispatchToProps = {
  fetchFieldTripDetails: fieldTripActions.fetchFieldTripDetails,
  fetchFieldTrips: fieldTripActions.fetchFieldTrips,
  initializeModules: callTakerActions.initializeModules
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintFieldTripLayout)
