import { connect } from 'react-redux'
import { Nav, Navbar } from 'react-bootstrap'
import React from 'react'

import { accountLinks, getAuth0Config } from '../../util/auth'
import { DEFAULT_APP_TITLE } from '../../util/constants'
import NavLoginButtonAuth0 from '../user/nav-login-button-auth0.js'

import AppMenu from './app-menu'
import LocaleSelector from './locale-selector'
import ViewSwitcher from './view-switcher'
/**
 * The desktop navigation bar, featuring a `branding` logo or a `title` text
 * defined in config.yml, and a sign-in button/menu with account links.
 *
 * The `branding` and `title` parameters in config.yml are handled
 * and shown in this order in the navigation bar:
 * 1. If `branding` is defined, it is shown, and no title is displayed.
 * 2. If `branding` is not defined but if `title` is, then `title` is shown.
 * 3. If neither is defined, just show 'OpenTripPlanner' (DEFAULT_APP_TITLE).
 *
 * TODO: merge with the mobile navigation bar.
 */
export type otpConfigType = {
  branding: string,
  language?: Record<string, unknown>,
  persistence: any,
  title: string
}

const DesktopNav = ({ otpConfig }: otpConfigType) => {
  const { branding, persistence, title = DEFAULT_APP_TITLE } = otpConfig
  const { language: configLanguages } = otpConfig
  const showLogin = Boolean(getAuth0Config(persistence))

  // Display branding and title in the order as described in the class summary.
  let brandingOrTitle
  if (branding) {
    brandingOrTitle = (
      <div
        className={`icon-${branding}`}
        // FIXME: Style hack for desktop view.
        style={{ marginLeft: 50 }}
      />
    )
  } else {
    brandingOrTitle = (
      <div className="navbar-title" style={{ marginLeft: 50 }}>
        {title}
      </div>
    )
  }

  return (
    <Navbar fluid inverse>
      {/* Required to allow the hamburger button to be clicked */}
      <Navbar.Header style={{ position: 'relative', zIndex: 2 }}>
        <Navbar.Brand>
          {/* TODO: Reconcile CSS class and inline style. */}
          <div
            className="app-menu-container"
            style={{ color: 'white', float: 'left', marginTop: '5px' }}
          >
            <AppMenu />
          </div>

          {brandingOrTitle}
        </Navbar.Brand>
      </Navbar.Header>
      <ViewSwitcher sticky />

      <Navbar.Collapse>
        <Nav pullRight>
          {configLanguages && Object.keys(configLanguages).length > 0 && (
            <LocaleSelector
              configLanguages={configLanguages}
              style={{ maxWidth: 60 }}
            />
          )}
          {showLogin && (
            <NavLoginButtonAuth0 id="login-control" links={accountLinks} />
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

// connect to the redux store

const mapStateToProps = (state) => {
  return {
    otpConfig: state.otp.config
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopNav)
