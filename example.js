// import necessary React/Redux libraries
import React, { Component } from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  EndpointsOverlay,
  ItineraryCarousel,
  ItineraryOverlay,
  LocationField,
  ModeSelector,
  DateTimeSelector,
  // NarrativeItineraries,
  BaseMap,
  BaseLayers,
  // OsmBaseLayer,
  PlanTripButton,
  createOtpReducer,
  ErrorMessage,
  OtpApp,
  SwitchButton
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
    otp: createOtpReducer(otpConfig), // add optional initial query here
    routing: routerReducer
    // add your own reducers if you want
  }),
  applyMiddleware(thunk, createLogger({duration: true, collapsed: true}))
)

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  render () {
    return (
      <OtpApp>
        <Navbar fluid>
          <Navbar.Brand>OpenTripPlanner</Navbar.Brand>
        </Navbar>
        <Grid fluid>
          <Row>
            <Col xs={12} md={4} className='sidebar'>
              <LocationField type='from' label='Enter start location or click on map...' />
              <LocationField type='to' label='Enter destination or click on map...' />
              <SwitchButton />
              <ModeSelector />
              <DateTimeSelector />
              <ErrorMessage />
              <PlanTripButton />
              {/* <NarrativeItineraries /> */}
              <ItineraryCarousel />
            </Col>
            <Col xsHidden md={8} className='map-container'>
              <BaseMap>
                <BaseLayers />
                <ItineraryOverlay />
                <EndpointsOverlay />
              </BaseMap>
            </Col>
          </Row>
        </Grid>
      </OtpApp>
    )
  }
}

// render the app
render(
  <Provider store={store}>
    { /**
      * If not using router history, simply include OtpRRExample here:
      * e.g.
      * <OtpRRExample />
      */
    }
    <Router history={history}>
      <Route path='/' component={props => <OtpApp {...props}><OtpRRExample /></OtpApp>} />
      {/* Single route with multiple options or multiple separate routes? */}
      <Route path='/@:latLonZoom(/plan)' component={props => <OtpApp {...props}><OtpRRExample /></OtpApp>} />
      <Route path='/plan' component={props => <OtpApp {...props}><OtpRRExample /></OtpApp>} />
    </Router>
  </Provider>,
  document.getElementById('root')
)
