import { Button, Nav, Navbar, NavItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from 'react-router'
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

export type Props = {
  doesLogoRedirectToUrl?: boolean
  doesLogoRefresh?: boolean
  otpConfig: Record<string, any>
  popupTarget?: string
  setPopupContent: (url: string) => void
  urlThatLogoRedirectsTo?: string
}

/**
 * The desktop navigation bar, featuring a `branding` logo or a `title` text
 * defined in config.yml, and a sign-in button/menu with account links.
 *
 * The `branding` and `title` parameters in config.yml are handled
 * and shown in this order in the navigation bar:
 * 1. If `branding` is defined, it is shown, and no title is displayed.
 *    (The title is still rendered for screen readers and browsers that lack image support.)
 * 2. If `branding` is not defined but if `title` is, then `title` is shown.
 * 3. If neither is defined, just show 'OpenTripPlanner' (DEFAULT_APP_TITLE).
 *
 * TODO: merge with the mobile navigation bar.
 */
const DesktopNav = ({
  doesLogoRedirectToUrl,
  doesLogoRefresh,
  otpConfig,
  popupTarget,
  setPopupContent,
  urlThatLogoRedirectsTo
}: Props) => {
  const history = useHistory()
  const intl = useIntl()
  const { branding, persistence, title = DEFAULT_APP_TITLE } = otpConfig
  const showLogin = Boolean(getAuth0Config(persistence))

  const _resetAndShowTripPlanner = () => {
    // use history to go back to the root path
    history.replace(history.location.pathname)
    history.push('..' + history.location.search)
    alert(
      'This action will reset your trip. Are you sure you want to continue?'
    )
    window.location.reload()
  }

  return (
    <header>
      <Navbar fluid inverse>
        <Navbar.Header
          style={{ position: 'relative', width: '100%', zIndex: 2 }}
        >
          <AppMenu />
          <Navbar.Brand>
            <Button
              aria-label={intl.formatMessage({
                id: 'components.AppMenu.agencyLogo'
              })}
              className="navbar-brand"
              onClick={() => {
                if (doesLogoRefresh) {
                  _resetAndShowTripPlanner()
                } else if (doesLogoRedirectToUrl) {
                  window.open(urlThatLogoRedirectsTo, '_blank')
                }
              }}
              role={
                // TODO: role "button" doesn't show up for screen readers
                doesLogoRefresh
                  ? 'button'
                  : doesLogoRedirectToUrl
                  ? 'link'
                  : 'none'
              }
              tabIndex={0}
              title="Agency logo button"
            >
              <div className={branding && `with-icon icon-${branding}`}>
                {/* A title is always rendered (e.g.for screen readers)
                  but is visually-hidden if a branding icon is used. */}
                <div className="navbar-title">{title}</div>
              </div>
            </Button>
          </Navbar.Brand>

          <ViewSwitcher sticky />

          <Nav pullRight>
            {popupTarget && (
              <NavItemOnLargeScreens
                onClick={() => setPopupContent(popupTarget)}
              >
                <FormattedMessage id={`config.popups.${popupTarget}`} />
              </NavItemOnLargeScreens>
            )}
            <LocaleSelector />
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
    </header>
  )
}

// connect to the redux store
const mapStateToProps = (state: Record<string, any>) => {
  return {
    doesLogoRedirectToUrl: state.otp.config?.navBar?.doesLogoRedirectToUrl,
    doesLogoRefresh: state.otp.config?.navBar?.doesLogoRefresh,
    otpConfig: state.otp.config,
    popupTarget: state.otp.config?.popups?.launchers?.toolbar,
    urlThatLogoRedirectsTo: state.otp.config?.navBar?.urlThatLogoRedirectsTo
  }
}

const mapDispatchToProps = {
  setPopupContent: uiActions.setPopupContent
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopNav)
