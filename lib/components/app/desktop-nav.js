import PropTypes from 'prop-types'
import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { connect } from 'react-redux'

import NavLoginButtonAuth0 from '../user/nav-login-button-auth0.js'
import { accountLinks, getAuth0Config } from '../../util/auth'
import AppMenu from './app-menu'

/**
 * The desktop navigation bar, featuring a sign-in button/menu.
 * TODO: merge with the mobile navigation bar.
 */
const DesktopNav = ({ otpConfig, title }) => {
  const { branding, persistence } = otpConfig
  const showLogin = Boolean(getAuth0Config(persistence))

  return (
    <Navbar fluid inverse>
      <Navbar.Header>
        <Navbar.Brand>
          {/* TODO: Reconcile CSS class and inline style. */}
          <div className='app-menu-container' style={{ float: 'left', color: 'white', fontSize: 28 }}>
            <AppMenu />
          </div>

          {branding && (
            <div
              className={`icon-${branding}`}
              // Style hack for desktop view.
              style={{ marginLeft: 50 }}
            />
          )}

          {title && (
            <div className='navbar-title' style={{ marginLeft: 50 }}>{title}</div>
          )}
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

DesktopNav.propTypes = {
  title: PropTypes.string
}

DesktopNav.defaultProps = {
  title: 'OpenTripPlanner'
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    otpConfig: state.otp.config
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopNav)
