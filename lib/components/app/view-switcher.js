import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { MainPanelContent, setMainPanelContent } from '../../actions/ui'

class ViewSwitcher extends Component {
  static propTypes = {
    activePanel: PropTypes.number,
    setMainPanelContent: PropTypes.func,
    sticky: PropTypes.bool
  }

  _showRouteViewer = () => {
    this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
  }
  _showTripPlanner = () => {
    this.props.setMainPanelContent(null)
  }

  render () {
    const { activePanel, sticky } = this.props

    return (
      <nav
        aria-label='Switcher'
        className='view-switcher'
        role='navigation'
        style={
          sticky && {
            height: '100%',
            left: 0,
            position: 'absolute',
            width: '100%'
          }
        }
      >
        <Button
          bsStyle='link'
          className={activePanel === null && 'active'}
          onClick={this._showTripPlanner}
        >
          <FormattedMessage id='components.BatchRoutingPanel.shortTitle' />
        </Button>
        <Button
          bsStyle='link'
          className={activePanel === MainPanelContent.ROUTE_VIEWER && 'active'}
          onClick={this._showRouteViewer}
        >
          <FormattedMessage id='components.RouteViewer.shortTitle' />
        </Button>
      </nav>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const {mainPanelContent} = state.otp.ui

  // Reverse the ID to string mapping
  let activePanel = Object.entries(MainPanelContent).find(
    (keyValuePair) => keyValuePair[1] === mainPanelContent
  )
  // activePanel is array of form [string, ID]
  // The trip planner has id null
  activePanel = (activePanel && activePanel[1]) || null

  return {
    activePanel
  }
}

const mapDispatchToProps = {
  setMainPanelContent
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewSwitcher))
