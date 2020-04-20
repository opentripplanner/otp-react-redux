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
import styled from 'styled-components'

// Auth0
import { push } from 'connected-react-router'
import qs from 'qs'
import { Auth0Provider } from 'use-auth0-hooks'
import { getAuthRedirectUri } from './lib/util/auth'
import { AUTH0_SCOPE } from './lib/util/constants'

// import Bootstrap Grid components for layout
import { Nav, Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  DefaultMainPanel,
  MobileMain,
  ResponsiveWebapp,
  Map,
  AppMenu,
  createOtpReducer
} from './lib'
import NavLoginButtonAuth0 from './lib/components/user/nav-login-button-auth0'

// load the OTP configuration
import otpConfig from './config.yml'
import auth0Config from './auth0config.yml'

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

const StyledNavbar = styled(Navbar)`
  > .container {
    width: 100%;
  }
`

// Auth0 functions
/**
 * Where to send the user after they have signed in.
 */
const onRedirectCallback = appState => {
  if (appState && appState.returnTo) {
    push(`${appState.returnTo.pathname}?${qs.stringify(appState.returnTo.query)}`)
  }
}

/**
 * When it hasn't been possible to retrieve a new access token.
 * @param {Error} err
 * @param {AccessTokenRequestOptions} options
 */
const onAccessTokenError = (err, options) => {
  console.error('Failed to retrieve access token: ', err)
}

/**
 * When signing in fails for some reason, we want to show it here.
 * @param {Error} err
 */
const onLoginError = (err) => {
  push(`/oops`)
}

/**
 * When redirecting to the login page you'll end up in this state where the login page is still loading.
 * You can render a message to show that the user is being redirected.
 */
const onRedirecting = () => {
  return (
    <div>
      <h1>Signing you in</h1>
      <p>
        In order to access this page you will need to sign in.
        Please wait while we redirect you to the login page...
      </p>
    </div>
  )
}

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  render () {
    /** desktop view **/
    const desktopView = (
      <div className='otp'>
        <StyledNavbar collapseOnSelect inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <div style={{ float: 'left', color: 'white', fontSize: 28 }}>
                <AppMenu />
              </div>
              <div className='navbar-title' style={{ marginLeft: 50 }}>OpenTripPlanner</div>
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              <NavLoginButtonAuth0
                id='login-control'
                links={[ // TODO: Move to config.
                  {
                    text: 'My account',
                    url: 'account'
                  },
                  {
                    text: 'Help',
                    url: 'help'
                  }
                ]}
              />
            </Nav>
          </Navbar.Collapse>
        </StyledNavbar>
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

    /** the main webapp **/
    return (
      <ResponsiveWebapp
        desktopView={desktopView}
        mobileView={mobileView}
      />
    )
  }
}

// render the app
render(
  <Auth0Provider
    audience={auth0Config.AUTH0_AUDIENCE}
    scope={AUTH0_SCOPE}
    domain={auth0Config.AUTH0_DOMAIN}
    clientId={auth0Config.AUTH0_CLIENT_ID}
    redirectUri={getAuthRedirectUri()}
    onLoginError={onLoginError}
    onAccessTokenError={onAccessTokenError}
    onRedirecting={onRedirecting}
    onRedirectCallback={onRedirectCallback}
  >
    <Provider store={store}>
      { /**
       * If not using router history, simply include OtpRRExample here:
       * e.g.
       * <OtpRRExample />
       */
      }
      <OtpRRExample />
    </Provider>
  </Auth0Provider>,

  document.getElementById('root')
)
