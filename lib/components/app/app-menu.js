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
    const { reactRouterConfig, languageConfig } = this.props

    return (
      <div className='app-menu'>
        <DropdownButton title={(<Icon type='bars' />)} noCaret className='app-menu-button' id='app-menu'>
          <MenuItem onClick={() => {
            this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
          }}><Icon type='bus' /> {languageConfig.routeViewer || 'Route Viewer'}</MenuItem>
          <MenuItem onClick={() => {
            let startOverUrl = '/'
            if (reactRouterConfig && reactRouterConfig.basename) {
              startOverUrl += reactRouterConfig.basename
            }
            window.location.href = startOverUrl
          }}><Icon type='undo' /> Start Over</MenuItem>
        </DropdownButton>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    languageConfig: state.otp.config.language
  }
}

const mapDispatchToProps = {
  setMainPanelContent
}

export default connect(mapStateToProps, mapDispatchToProps)(AppMenu)
