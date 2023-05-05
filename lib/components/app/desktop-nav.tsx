import { Button, Nav, Navbar, NavItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import { accountLinks, getAuth0Config } from '../../util/auth'
import { DEFAULT_APP_TITLE } from '../../util/constants'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import NavLoginButtonAuth0 from '../user/nav-login-button-auth0'
import startOver from '../util/start-over'

import AppMenu from './app-menu'
import LocaleSelector from './locale-selector'
import ViewSwitcher from './view-switcher'

const NavItemOnLargeScreens = styled(NavItem)`
  display: block;
  @media (max-width: 768px) {
    display: none !important;
  }
`

const TransparentButton = styled(Button)`
  display: block;
  height: 100%;
  width: 100%;
`
// Typscript TODO: otpConfig type
export type Props = {
  agencyName?: string
  logoClickAction?: string
  otpConfig: Record<string, any>
  popupTarget?: string
  reactRouterConfig?: { basename: string }
  setPopupContent: (url: string) => void
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
 * The `logoClickAction` parameter in config.yml is handled as follows:
 * 1. If `logoClickAction` is not defined, then clicking the logo does nothing.
 * 2. If `logoClickAction` is set to 'start-over', then clicking the logo will
 *   start over the search.
 * 3. If `logoClickAction` is set to a URL, then clicking the logo will go to that URL.
 *
 * The operatorName parameter can be defined in config.yml if the app title is different from the operator name.
 *
 * TODO: merge with the mobile navigation bar.
 */
const DesktopNav = ({
  logoClickAction,
  otpConfig,
  popupTarget,
  reactRouterConfig,
  setPopupContent
}: Props) => {
  const {
    branding,
    operatorName,
    persistence,
    title = DEFAULT_APP_TITLE
  } = otpConfig
  const showLogin = Boolean(getAuth0Config(persistence))
  const intl = useIntl()
  const isExternalLink = logoClickAction?.startsWith('http')
  const willStartOver = logoClickAction === 'start-over'

  const handleClick = () => {
    if (
      willStartOver &&
      window.confirm(
        intl.formatMessage(
          { id: 'components.AppMenu.agencyLogoResetWarning' },
          { agencyName: operatorName || title }
        )
      )
    ) {
      window.location.href = startOver(reactRouterConfig?.basename)
    } else if (
      isExternalLink &&
      window.confirm(
        intl.formatMessage(
          { id: 'components.AppMenu.agencyLogoRedirectWarning' },
          { agencyName: operatorName || title }
        )
      )
    ) {
      window.location.href = logoClickAction || ''
    }
  }

  return (
    <header>
      <Navbar fluid inverse>
        <Navbar.Header
          style={{ position: 'relative', width: '100%', zIndex: 2 }}
        >
          <Navbar.Brand>
            <AppMenu />
            <div
              className={branding && `with-icon icon-${branding}`}
              style={{ marginLeft: 50 }}
            >
              <div className="navbar-title">{title}</div>
              {willStartOver && (
                <TransparentButton
                  bsStyle="link"
                  onClick={handleClick}
                  role="link"
                >
                  <InvisibleA11yLabel>
                    <FormattedMessage
                      id="components.AppMenu.agencyLogoReset"
                      values={{ agencyName: operatorName || title }}
                    />
                  </InvisibleA11yLabel>
                </TransparentButton>
              )}
              {isExternalLink && (
                <TransparentButton
                  bsStyle="link"
                  onClick={handleClick}
                  role="link"
                  title={intl.formatMessage(
                    {
                      id: 'components.AppMenu.agencyLogoUrl'
                    },
                    { agencyName: operatorName || title }
                  )}
                >
                  <InvisibleA11yLabel>
                    <FormattedMessage
                      id="components.AppMenu.agencyLogoUrl"
                      values={{ agencyName: operatorName || title }}
                    />
                  </InvisibleA11yLabel>
                </TransparentButton>
              )}
            </div>
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
    logoClickAction: state.otp.config?.navBar?.logoClickAction,
    otpConfig: state.otp.config,
    popupTarget: state.otp.config?.popups?.launchers?.toolbar,
    reactRouterConfig: state.otp.config.reactRouter
  }
}

const mapDispatchToProps = {
  setPopupContent: uiActions.setPopupContent
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopNav)
