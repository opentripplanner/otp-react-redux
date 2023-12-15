import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { connect } from 'react-redux'
import { Navbar } from 'react-bootstrap'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import { accountLinks, getAuth0Config } from '../../util/auth'
import { ComponentContext } from '../../util/contexts'
import { injectIntl } from 'react-intl'
import { StyledIconWrapper } from '../util/styledIcon'
import AppMenu from '../app/app-menu'
import LocaleSelector from '../app/locale-selector'
import NavLoginButtonAuth0 from '../../components/user/nav-login-button-auth0'
import PageTitle from '../util/page-title'

const MobileBar = styled.div`
  & > li svg {
    height: 18px;
  }
`

class MobileNavigationBar extends Component {
  static propTypes = {
    auth0Config: PropTypes.object,
    backScreen: PropTypes.number,
    configLanguages: PropTypes.object,
    defaultMobileTitle: PropTypes.string,
    extraMenuItems: PropTypes.array,
    headerAction: PropTypes.element,
    headerText: PropTypes.string,
    intl: PropTypes.object,
    locale: PropTypes.string,
    onBackClicked: PropTypes.func,
    setMobileScreen: PropTypes.func,
    showBackButton: PropTypes.bool
  }

  static contextType = ComponentContext

  _backButtonPressed = () => {
    const { backScreen, onBackClicked } = this.props
    if (backScreen) this.props.setMobileScreen(this.props.backScreen)
    else if (typeof onBackClicked === 'function') onBackClicked()
  }

  render() {
    const {
      auth0Config,
      configLanguages,
      defaultMobileTitle,
      extraMenuItems,
      headerAction,
      headerText,
      intl,
      locale,
      showBackButton
    } = this.props

    const backButtonText = intl.formatMessage({ id: 'common.forms.back' })

    return (
      <header>
        <Navbar className="mobile-navbar-container" fixedTop fluid>
          <Navbar.Header>
            <Navbar.Brand>
              {showBackButton ? (
                <button
                  aria-label={backButtonText}
                  className="mobile-back"
                  title={backButtonText}
                >
                  <StyledIconWrapper onClick={this._backButtonPressed}>
                    <ArrowLeft />
                  </StyledIconWrapper>
                </button>
              ) : (
                <AppMenu />
              )}
            </Navbar.Brand>
          </Navbar.Header>

          <PageTitle title={headerText} />
          <div className="mobile-header">
            {headerText ? (
              <h1 className="mobile-header-text">{headerText}</h1>
            ) : (
              <h1>{defaultMobileTitle}</h1>
            )}
          </div>

          {headerAction && (
            <div className="mobile-close">
              <div className="mobile-header-action">{headerAction}</div>
            </div>
          )}

          <MobileBar className="locale-selector-and-login">
            <LocaleSelector configLanguages={configLanguages} />
            {/* HACK: Normally, NavLoginButtonAuth0 should be inside a <Nav> element,
                however, in mobile mode, react-bootstrap's <Nav> causes the
                submenus of this component to be displayed full-screen-width,
                and that behavior is not desired here. */}
            {auth0Config && (
              <NavLoginButtonAuth0
                id="login-control"
                links={accountLinks(extraMenuItems)}
                locale={locale}
              />
            )}
          </MobileBar>
        </Navbar>
      </header>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  return {
    auth0Config: getAuth0Config(state.otp.config.persistence),
    configLanguages: state.otp.config.language,
    extraMenuItems: state.otp?.config?.extraMenuItems,
    locale: state.otp.ui.locale
  }
}

const mapDispatchToProps = {
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MobileNavigationBar))
