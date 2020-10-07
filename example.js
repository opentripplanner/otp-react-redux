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
import { Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  CallTakerControls,
  CallTakerPanel,
  CallTakerWindows,
  DefaultMainPanel,
  DesktopNav,
  BatchRoutingPanel,
  Map,
  MobileMain,
  ResponsiveWebapp,
  createCallTakerReducer,
  createOtpReducer,
  createUserReducer
} from './lib'
// load the OTP configuration
import otpConfig from './config.yml'

// Set useCustomIcons to true to override classic icons with the exports from
// custom-icons.js
const useCustomIcons = false

// Define icon sets for modes.
let MyLegIcon = ClassicLegIcon
let MyModeIcon = ClassicModeIcon

if (useCustomIcons) {
  const CustomIcons = require('./custom-icons')
  MyLegIcon = CustomIcons.CustomLegIcon
  MyModeIcon = CustomIcons.CustomModeIcon
}

// create an initial query for demo/testing purposes
const initialQuery = {
  from: {
    lat: 52.617899,
    lon: -2.197704
  },
  to: {
    lat: 52.352798,
    lon: -1.406688
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
    callTaker: createCallTakerReducer(),
    otp: createOtpReducer(otpConfig, initialQuery),
    user: createUserReducer(),
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
        <DesktopNav />
        <Grid>
          <Row className='main-row'>
            <Col sm={6} md={4} className='sidebar'>
              {/*
                Note: the main tag provides a way for users of screen readers
                to skip to the primary page content.
                TODO: Find a better place.
              */}
              <main>
                {/* TODO: extract the BATCH elements out of CallTakerPanel. */}
                {otpConfig.datastoreUrl
                  ? <CallTakerPanel LegIcon={MyLegIcon} ModeIcon={MyModeIcon} />
                  : otpConfig.routingTypes.find(t => t.key === 'BATCH')
                    ? <BatchRoutingPanel LegIcon={MyLegIcon} ModeIcon={MyModeIcon} />
                    : <DefaultMainPanel LegIcon={MyLegIcon} ModeIcon={MyModeIcon} />
                }
              </main>
            </Col>
            {otpConfig.datastoreUrl ? <CallTakerControls /> : null}
            <Col sm={6} md={8} className='map-container'>
              {otpConfig.datastoreUrl ? <CallTakerWindows /> : null}
              <Map />
            </Col>
          </Row>
        </Grid>
      </div>
    )

    /** mobile view **/
    const mobileView = (
      // <main> Needed for accessibility checks. TODO: Find a better place.
      <main>
        <MobileMain
          LegIcon={MyLegIcon}
          ModeIcon={MyModeIcon}
          map={<Map />}
          title={<div className='navbar-title'>OpenTripPlanner</div>}
        />
      </main>
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
  (
    <Provider store={store}>
      { /**
     * If not using router history, simply include OtpRRExample here:
     * e.g.
     * <OtpRRExample />
     */
      }
      <OtpRRExample />
    </Provider>
  )
  ,

  document.getElementById('root')
)
