import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { connect } from 'react-redux'
import { Navbar } from 'react-bootstrap'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
import { accountLinks, getAuth0Config } from '../../util/auth'
import { ComponentContext } from '../../util/contexts'
import { StyledIconWrapper } from '../util/styledIcon'
import AppMenu from '../app/app-menu'
import LocaleSelector from '../app/locale-selector'
import NavLoginButtonAuth0 from '../../components/user/nav-login-button-auth0'

class MobileNavigationBar extends Component {
  static propTypes = {
    auth0Config: PropTypes.object,
    backScreen: PropTypes.number,
    configLanguages: PropTypes.object,
    defaultMobileTitle: PropTypes.string,
    headerAction: PropTypes.element,
    headerText: PropTypes.node,
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
      headerAction,
      headerText,
      showBackButton
    } = this.props

    return (
      <header>
        <Navbar className="mobile-navbar-container" fixedTop fluid>
          <Navbar.Header>
            <Navbar.Brand>
              {showBackButton ? (
                <div className="mobile-back">
                  <StyledIconWrapper onClick={this._backButtonPressed}>
                    <ArrowLeft />
                  </StyledIconWrapper>
                </div>
              ) : (
                <AppMenu />
              )}
            </Navbar.Brand>
          </Navbar.Header>

          <div className="mobile-header">
            {headerText ? (
              <div className="mobile-header-text">{headerText}</div>
            ) : (
              <div>{defaultMobileTitle}</div>
            )}
          </div>

          {headerAction && (
            <div className="mobile-close">
              <div className="mobile-header-action">{headerAction}</div>
            </div>
          )}

          <div className="locale-selector-and-login">
            {configLanguages &&
              // Ensure that > 1 valid language is defined
              Object.keys(configLanguages).filter(
                (key) => key !== 'allLanguages' && configLanguages[key].name
              ).length > 1 && (
                <LocaleSelector
                  className="locale-selector"
                  configLanguages={configLanguages}
                />
              )}
            {/* HACK: Normally, NavLoginButtonAuth0 should be inside a <Nav> element,
                however, in mobile mode, react-bootstrap's <Nav> causes the
                submenus of this component to be displayed full-screen-width,
                and that behavior is not desired here. */}
            {auth0Config && (
              <NavLoginButtonAuth0 id="login-control" links={accountLinks} />
            )}
          </div>
        </Navbar>
      </header>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  return {
    auth0Config: getAuth0Config(state.otp.config.persistence),
    configLanguages: state.otp.config.language
  }
}

const mapDispatchToProps = {
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileNavigationBar)
