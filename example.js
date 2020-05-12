// import this polyfill in order to make webapp compatible with IE 11
import 'es6-math'

import {ClassicLegIcon, ClassicModeIcon} from '@opentripplanner/icons'
import { createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import React, { Component } from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  DefaultMainPanel,
  MobileMain,
  ResponsiveWebapp,
  Map,
  AppMenu,
  createOtpReducer
} from './lib'
// load the OTP configuration
import otpConfig from './config.yml'

// Set useCustomIcons to true to override classic icons with the exports from
// custom-icons.js
const useCustomIcons = true

// Define icon sets for modes.
let MyLegIcon = ClassicLegIcon
let MyModeIcon = ClassicModeIcon

if (useCustomIcons) {
  const CustomIcons = require('./custom-icons')
  MyLegIcon = CustomIcons.CustomLegIcon
  MyModeIcon = CustomIcons.CustomModeIcon
}

/**
 * For testing, try uncommenting the following two statements (and comment the two above),
 * and see how the icons get changed in:
 * - the mode options panel (select transit, bike+transit, etc.)
 * - the itinerary narrative (step-by-step directions).
 */
// const MyLegIcon = () => <Ferry />
// const MyModeIcon = () => <AerialTram />

// create an initial query for demo/testing purposes
const initialQuery = {
  from: {
    lat: 45.5246,
    lon: -122.6710
  },
  to: {
    lat: 45.5307,
    lon: -122.6647
  },
  type: 'ITINERARY'
}

const history = createHashHistory()
const middleware = [
  thunk,
  routerMiddleware(history) // for dispatching history actions
]

// check if app is being run in development mode. If so, enable redux-logger
if (process.env.NODE_ENV === 'development') {
  middleware.push(createLogger())
}

// set up the Redux store
const store = createStore(
  combineReducers({
    otp: createOtpReducer(otpConfig),
    router: connectRouter(history)
  }),
  compose(applyMiddleware(...middleware))
)

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  render () {
    /** desktop view **/
    const desktopView = (
      <div className='otp'>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <div style={{ float: 'left', color: 'white', fontSize: 28 }}>
                <AppMenu />
              </div>
              <div className='navbar-title' style={{ marginLeft: 50 }}>OpenTripPlanner</div>
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>
        <Grid>
          <Row className='main-row'>
            <Col sm={6} md={4} className='sidebar'>
              <DefaultMainPanel LegIcon={MyLegIcon} ModeIcon={MyModeIcon} />
            </Col>
            <Col sm={6} md={8} className='map-container'>
              <Map />
            </Col>
          </Row>
        </Grid>
      </div>
    )

    /** mobile view **/
    const mobileView = (
      <MobileMain
        LegIcon={MyLegIcon}
        ModeIcon={MyModeIcon}
        map={<Map />}
        title={<div className='navbar-title'>OpenTripPlanner</div>}
      />
    )

    /** the main webapp **/
    return (
      <ResponsiveWebapp
        desktopView={desktopView}
        mobileView={mobileView}
        LegIcon={MyLegIcon}
      />
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
    <OtpRRExample />

  </Provider>,
  document.getElementById('root')
)
