import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Nav, Navbar, NavItem } from 'react-bootstrap'
import React from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import { accountLinks, getAuth0Config } from '../../util/auth'
import { DEFAULT_APP_TITLE } from '../../util/constants'
import NavLoginButtonAuth0 from '../user/nav-login-button-auth0'

import AppMenu from './app-menu'
import LocaleSelector from './locale-selector'
import ViewSwitcher from './view-switcher'

const NavItemOnLargeScreens = styled(NavItem)`
  display: block;
  @media (max-width: 768px) {
    display: none !important;
  }
`

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
// Typscript TODO: otpConfig type
export type Props = {
  otpConfig: any
  popupTarget?: string
  setPopupContent: (url: string) => void
}

const DesktopNav = ({ otpConfig, popupTarget, setPopupContent }: Props) => {
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
      <Navbar.Header style={{ position: 'relative', width: '100%', zIndex: 2 }}>
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
        {/* @ts-expect-error typescript is having some trouble with complex type merges here */}
        <ViewSwitcher sticky />

        <Nav pullRight>
          {popupTarget && (
            <NavItemOnLargeScreens onClick={() => setPopupContent(popupTarget)}>
              <FormattedMessage id={`config.popups.${popupTarget}`} />
            </NavItemOnLargeScreens>
          )}
          {configLanguages &&
            // Ensure that > 1 valid language is defined
            Object.keys(configLanguages).filter(
              (key) => key !== 'allLanguages' && configLanguages[key].name
            ).length > 1 && (
              <LocaleSelector configLanguages={configLanguages} />
            )}
          {showLogin && (
            <NavLoginButtonAuth0
              id="login-control"
              links={accountLinks}
              style={{ float: 'right' }}
            />
          )}
        </Nav>
      </Navbar.Header>
    </Navbar>
  )
}

// connect to the redux store
// Typescript TODO: state type
const mapStateToProps = (state: any) => {
  return {
    otpConfig: state.otp.config,
    popupTarget: state.otp.config?.popups?.launchers?.toolbar
  }
}

const mapDispatchToProps = {
  setPopupContent: uiActions.setPopupContent
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopNav)
