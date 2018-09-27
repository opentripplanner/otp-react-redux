import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DropdownButton, MenuItem } from 'react-bootstrap'

import Icon from '../narrative/icon'

import { MainPanelContent, setMainPanelContent } from '../../actions/ui'

// TODO: make menu items configurable via props/config

class AppMenu extends Component {
  static propTypes = {
    setMainPanelContent: PropTypes.func
  }

  render () {
    const { reactRouterConfig } = this.props

    let href = '/'
    if (reactRouterConfig && reactRouterConfig.basename) {
      href += reactRouterConfig.basename
    }

    return (
      <div className='app-menu'>
        <DropdownButton title={(<Icon type='bars' />)} noCaret className='app-menu-button' id='app-menu'>
          <MenuItem onClick={() => {
            window.location.href = href
          }}><Icon type='undo' /> Start Over</MenuItem>
          <MenuItem onClick={() => {
            this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
          }}><Icon type='bus' /> Route Viewer</MenuItem>
        </DropdownButton>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    reactRouterConfig: state.otp.config.reactRouter
  }
}

const mapDispatchToProps = {
  setMainPanelContent
}

export default connect(mapStateToProps, mapDispatchToProps)(AppMenu)
