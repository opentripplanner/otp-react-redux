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
import NavLoginButton from './lib/components/user/nav-login-button'

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

const StyledNavbar = styled(Navbar)`
  > .container {
    width: 100%;
  }
`

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  handleSignIn() {}

  handleSignOut() {}

  handleSignUp() {}

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
              <NavLoginButton
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
                onSignInClick={this.handleSignIn}
                onSignOutClick={this.handleSignOut}
                onSignUpClick={this.handleSignUp}
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
