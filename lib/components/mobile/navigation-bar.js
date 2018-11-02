import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Navbar } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

import AppMenu from '../app/app-menu'
import { setMobileScreen } from '../../actions/ui'

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
    console.log('back button pressed')
    const { backScreen, onBackClicked } = this.props
    if (backScreen) this.props.setMobileScreen(this.props.backScreen)
    else if (typeof onBackClicked === 'function') onBackClicked()
  }

  render () {
    const { showBackButton, headerAction, headerText, title } = this.props

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
           : <div>{title}</div>
          }
        </div>

        {headerAction && (
          <div className='mobile-close'>
            <div className='mobile-header-action'>{headerAction}</div>
          </div>
        )}
      </Navbar>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = {
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileNavigationBar)
