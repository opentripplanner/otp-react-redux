import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Navbar } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setMobileScreen } from '../../actions/ui'
import AppMenu from '../app/app-menu'
import ViewSwitcher from '../app/view-switcher'
import NavLoginButtonAuth0 from '../../components/user/nav-login-button-auth0'
import Icon from '../narrative/icon'
import { accountLinks, getAuth0Config } from '../../util/auth'
import { ComponentContext } from '../../util/contexts'

class MobileNavigationBar extends Component {
  static propTypes = {
    backScreen: PropTypes.number,
    headerAction: PropTypes.element,
    headerText: PropTypes.string,
    setMobileScreen: PropTypes.func,
    showBackButton: PropTypes.bool
  }

  static contextType = ComponentContext

  _backButtonPressed = () => {
    const { backScreen, onBackClicked } = this.props
    if (backScreen) this.props.setMobileScreen(this.props.backScreen)
    else if (typeof onBackClicked === 'function') onBackClicked()
  }

  render () {
    const {
      auth0Config,
      headerAction,
      headerText,
      showBackButton
    } = this.props

    return (
      <Navbar fixedTop fluid>

        <Navbar.Header>
          <Navbar.Brand>
            {showBackButton
              ? (
                <div className='mobile-back'>
                  <Icon
                    fixedWidth={false}
                    name='arrow-left'
                    onClick={this._backButtonPressed}
                  />
                </div>
              )
              : <AppMenu />
            }
          </Navbar.Brand>
        </Navbar.Header>

        <div className='mobile-header'>
          {headerText
            ? <div className='mobile-header-text'>{headerText}</div>
            : <ViewSwitcher />
          }
        </div>

        {headerAction && (
          <div className='mobile-close'>
            <div className='mobile-header-action'>{headerAction}</div>
          </div>
        )}

        {/**
          * HACK: Normally, NavLoginButtonAuth0 should be inside a <Nav> element,
          * however, in mobile mode, react-bootstrap's <Nav> causes the
          * submenus of this component to be displayed full-screen-width,
          * and that behavior is not desired here.
          */}
        {auth0Config && (
          <NavLoginButtonAuth0
            id='login-control'
            links={accountLinks}
          />
        )}
      </Navbar>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    auth0Config: getAuth0Config(state.otp.config.persistence)
  }
}

const mapDispatchToProps = {
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileNavigationBar)
