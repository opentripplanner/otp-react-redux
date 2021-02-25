import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Navbar } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'

import { setMobileScreen } from '../../actions/ui'
import AppMenu from '../app/app-menu'
import NavLoginButtonAuth0 from '../../components/user/nav-login-button-auth0'
import { accountLinks, getAuth0Config } from '../../util/auth'
import { ComponentContext } from '../../util/contexts'

class MobileNavigationBar extends Component {
  static propTypes = {
    backScreen: PropTypes.number,
    headerAction: PropTypes.element,
    headerText: PropTypes.string,
    showBackButton: PropTypes.bool,
    setMobileScreen: PropTypes.func
  }

  static contextType = ComponentContext

  _backButtonPressed = () => {
    const { backScreen, onBackClicked } = this.props
    if (backScreen) this.props.setMobileScreen(this.props.backScreen)
    else if (typeof onBackClicked === 'function') onBackClicked()
  }

  render () {
    const { defaultMobileTitle } = this.context
    const {
      auth0Config,
      headerAction,
      headerText,
      showBackButton
    } = this.props

    return (
      <Navbar fluid fixedTop>

        <Navbar.Header>
          <Navbar.Brand>
            {showBackButton
              ? <div className='mobile-back'><FontAwesome name='arrow-left' onClick={this._backButtonPressed} /></div>
              : <AppMenu />
            }
          </Navbar.Brand>
        </Navbar.Header>

        <div className='mobile-header'>
          {headerText
            ? <div className='mobile-header-text'>{headerText}</div>
            : <div>{defaultMobileTitle}</div>
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
