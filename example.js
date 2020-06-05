// import this polyfill in order to make webapp compatible with IE 11
import 'es6-math'

import { createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import React, { Component } from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

// Auth0
import { Auth0Provider } from 'use-auth0-hooks'
import { accountLinks, getAuth0Callbacks, getAuth0Config } from './lib/util/auth'
import { AUTH0_SCOPE, URL_ROOT } from './lib/util/constants'

// import Bootstrap Grid components for layout
import { Nav, Navbar, Grid, Row, Col } from 'react-bootstrap'

// import Auth0Wrapper from './lib/components/user/auth0-wrapper'

// import OTP-RR components
import {
  AppMenu,
  DefaultMainPanel,
  Map,
  MobileMain,
  NavLoginButtonAuth0,
  ResponsiveWebapp,
  createOtpReducer
} from './lib'

// load the OTP configuration
import otpConfig from './config.yml'

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

// Auth0 config and callbacks.
const auth0Config = getAuth0Config(otpConfig.persistence)
const auth0Callbacks = getAuth0Callbacks(store)

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  render () {
    /** desktop view **/
    const desktopView = (
      <div className='otp'>
        <Navbar fluid inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <div style={{ float: 'left', color: 'white', fontSize: 28 }}>
                <AppMenu />
              </div>
              <div className='navbar-title' style={{ marginLeft: 50 }}>OpenTripPlanner</div>
            </Navbar.Brand>
          </Navbar.Header>

          {auth0Config && (
            <Navbar.Collapse>
              <Nav pullRight>
                <NavLoginButtonAuth0
                  id='login-control'
                  links={accountLinks}
                />
              </Nav>
            </Navbar.Collapse>
          )}
        </Navbar>
        <Grid>
          <Row className='main-row'>
            <Col sm={6} md={4} className='sidebar'>
              <DefaultMainPanel />
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
      <MobileMain map={(<Map />)} title={(<div className='navbar-title'>OpenTripPlanner</div>)} />
    )

    const responsiveWebAppRender = <ResponsiveWebapp
      desktopView={desktopView}
      mobileView={mobileView}
    />

    /** the main webapp **/
    // It seems much better to use our Auth0Wrapper here.
    // Auth0 data will be passed to ResponsiveWebApp as prop.auth.
    // Then you don't have to worry about adding the wrapper anywhere else.
    /*
    return auth0Config
      ? (
        <Auth0Wrapper awaitToken={false}>
          {responsiveWebAppRender}
        </Auth0Wrapper>
      )
      : responsiveWebAppRender
    */
    return responsiveWebAppRender
  }
}

const innerProvider = (
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

// render the app
render(auth0Config
  ? (<Auth0Provider
    audience={auth0Config.audience}
    scope={AUTH0_SCOPE}
    domain={auth0Config.domain}
    clientId={auth0Config.clientId}
    redirectUri={URL_ROOT}
    {...auth0Callbacks}
  >
    {innerProvider}
  </Auth0Provider>)
  : innerProvider
,

document.getElementById('root')
)
