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
  BaseLayers,
  BaseMap,
  BikeRentalOverlay,
  DateTimeSelector,
  EndpointsOverlay,
  ErrorMessage,
  ItineraryOverlay,
  LocationField,
  NarrativeItineraries,
  PlanTripButton,
  TransitiveOverlay,
  SettingsSelectorPanel,
  SwitchButton,

  createOtpReducer
} from './lib'

// load the OTP configuration
import otpConfig from './config.yml'

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

const transitiveData = {"places":[{"place_id":"from","place_lat":45.5312746911948,"place_lon":-122.68535614013673,"place_name":"From"},{"place_id":"to","place_lat":45.523307418747926,"place_lon":-122.67608642578126,"place_name":"To"}]}

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  render () {
    return (<div className='otp'>
      <Navbar fluid>
        <Navbar.Brand>OpenTripPlanner</Navbar.Brand>
      </Navbar>
      <Grid fluid>
        <Row className='main-row'>
          <Col xs={12} md={4} className='sidebar'>
            <LocationField type='from' label='Enter start location or click on map...' />
            <LocationField type='to' label='Enter destination or click on map...' />
            <SwitchButton />
            <DateTimeSelector />
            <SettingsSelectorPanel />
            <ErrorMessage />
            <PlanTripButton />
            <NarrativeItineraries />
          </Col>

          <Col xsHidden md={8} className='map-container'>
            <BaseMap>
              <BaseLayers />
              <BikeRentalOverlay />
              <ItineraryOverlay />
              <TransitiveOverlay transitiveData={transitiveData} />
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
