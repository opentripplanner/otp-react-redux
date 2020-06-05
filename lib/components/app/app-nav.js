import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { connect } from 'react-redux'

import NavLoginButtonAuth0 from '../user/nav-login-button-auth0.js'
import { accountLinks, getAuth0Config } from '../../util/auth'

import AppMenu from './app-menu'

const AppNav = ({ otpConfig }) => {
  const { branding, persistence } = otpConfig
  const showLogin = getAuth0Config(persistence)

  return (
    <Navbar fluid inverse>
      <Navbar.Header>
        <Navbar.Brand>
          <div className='app-menu-container'>
            <AppMenu />
          </div>
          <div
            className={`icon-${branding}`}
            // This style is applied here because it is only intended for
            // desktop view.
            style={{ marginLeft: 50 }}
          />
        </Navbar.Brand>
      </Navbar.Header>

      {showLogin && (
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
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    otpConfig: state.otp.config
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(AppNav)
