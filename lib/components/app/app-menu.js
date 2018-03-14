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
    return (
      <div className='app-menu'>
        <DropdownButton title={(<Icon type='bars' />)} noCaret className='app-menu-button' id='app-menu'>
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
  }
}

const mapDispatchToProps = {
  setMainPanelContent
}

export default connect(mapStateToProps, mapDispatchToProps)(AppMenu)
