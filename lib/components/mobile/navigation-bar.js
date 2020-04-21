import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Navbar } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'

import { setMobileScreen } from '../../actions/ui'

import AppMenu from '../app/app-menu'
import NavLoginButtonAuth0 from '../../components/user/nav-login-button-auth0'
import { getAuth0Config } from '../../util/auth'

class MobileNavigationBar extends Component {
  static propTypes = {
    backScreen: PropTypes.number,
    headerAction: PropTypes.element,
    headerText: PropTypes.string,
    showBackButton: PropTypes.bool,
    setMobileScreen: PropTypes.func,
    title: PropTypes.element
  }

  _backButtonPressed = () => {
    const { backScreen, onBackClicked } = this.props
    if (backScreen) this.props.setMobileScreen(this.props.backScreen)
    else if (typeof onBackClicked === 'function') onBackClicked()
  }

  render () {
    const { config, showBackButton, headerAction, headerText, title } = this.props
    const auth0Config = getAuth0Config(config)

    return (
      <Navbar fluid fixedTop inverse>

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
            : <div>{title}</div>
          }
        </div>

        {headerAction && (
          <div className='mobile-close'>
            <div className='mobile-header-action'>{headerAction}</div>
          </div>
        )}

        {auth0Config && (
          <NavLoginButtonAuth0
            id='login-control'
            links={[ // TODO: Move to config.
              {
                text: 'My Account',
                url: 'account'
              },
              {
                text: 'Help',
                url: 'help'
              }
            ]}
            pullRight
            style={{position: 'fixed', right: 0, padding: '15px', top: 0}}
          >
          </NavLoginButtonAuth0>
        )}
        <style jsx>{`
          .otp.mobile .navbar .container-fluid > li {
            display: block;
          }
          .otp.mobile .navbar .container-fluid > li > a {
            color: #9d9d9d;
          }
          .otp.mobile .navbar li.dropdown.open {
            background-color: #080808;
          }
          .otp.mobile .navbar .container-fluid > li.dropdown.open > a {
            color: #fff;
          }
        `}
        </style>
      </Navbar>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config
  }
}

const mapDispatchToProps = {
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileNavigationBar)
