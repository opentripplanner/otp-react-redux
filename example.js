// import necessary React/Redux libraries
import React, { Component } from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  EndpointsOverlay,
  ItineraryOverlay,
  LocationField,
  NarrativeItineraries,
  BaseMap,
  OsmBaseLayer,
  PlanTripButton,
  createOtpReducer
} from './lib'

// load the OTP configurtation
import otpConfig from './example-config.yml'

// create an initial query for demo/testing purposes
/* const initialQuery = {
  from: {
    name: 'PDX',
    lat: 45.589180,
    lon: -122.593460
  },
  to: {
    name: 'TTO',
    lat: 45.518950,
    lon: -122.679565
  }
} */

// set up the Redux store
const store = createStore(
  combineReducers({
    otp: createOtpReducer(otpConfig) // add optional initial query here
    // add your own reducers if you want
  }),
  applyMiddleware(thunk, createLogger())
)

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  render () {
    return (<div className='otp'>
      <Navbar fluid>
        <Navbar.Brand>OpenTripPlanner</Navbar.Brand>
      </Navbar>
      <Grid fluid>
        <Row>
          <Col xs={12} md={4} className='sidebar'>
            <LocationField fieldName='from' label='Start Location' />
            <LocationField fieldName='to' />
            <PlanTripButton />
            <NarrativeItineraries />
          </Col>

          <Col xsHidden md={8} className='map-container'>
            <BaseMap>
              <OsmBaseLayer />
              <ItineraryOverlay />
              <EndpointsOverlay />
            </BaseMap>
          </Col>
        </Row>
      </Grid>
    </div>)
  }
}

// render the app
render(
  <Provider store={store}>
    <OtpRRExample />
  </Provider>,
  document.getElementById('root')
)
