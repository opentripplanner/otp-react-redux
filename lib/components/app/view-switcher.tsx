import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { withRouter } from 'react-router'
import React, { Component } from 'react'

import { MainPanelContent, setMainPanelContent } from '../../actions/ui'

type Props = {
  activePanel: number | null
  intl: IntlShape
  setMainPanelContent: (panel?: number | null) => void
  sticky: boolean
}

/**
 * This component is a switcher between
 * the main views of the application.
 */
class ViewSwitcher extends Component<Props> {
  _showRouteViewer = () => {
    this.props.setMainPanelContent(null)
    this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
  }

  _showTripPlanner = () => {
    this.props.setMainPanelContent(null)
  }

  render() {
    const { activePanel, intl, sticky } = this.props

    const tripPlannerActive = activePanel === null
    const routeViewerActive = activePanel === MainPanelContent.ROUTE_VIEWER

    return (
      <div
        aria-label={intl.formatMessage({
          id: 'components.ViewSwitcher.switcher'
        })}
        className="view-switcher"
        id="view-switcher"
        role="group"
        style={
          sticky
            ? {
                height: '100%',
                left: 0,
                position: 'absolute',
                width: '100%'
              }
            : {}
        }
      >
        <Button
          aria-controls="view-switcher"
          aria-selected={tripPlannerActive}
          bsStyle="link"
          className={`${tripPlannerActive && 'active'}`}
          onClick={this._showTripPlanner}
        >
          <FormattedMessage id="components.BatchRoutingPanel.shortTitle" />
        </Button>
        <Button
          aria-controls="view-switcher"
          aria-selected={routeViewerActive}
          bsStyle="link"
          className={`${routeViewerActive && 'active'}`}
          onClick={this._showRouteViewer}
        >
          <FormattedMessage id="components.RouteViewer.shortTitle" />
        </Button>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: any) => {
  const { mainPanelContent } = state.otp.ui

  // Reverse the ID to string mapping
  const activePanelPair = Object.entries(MainPanelContent).find(
    (keyValuePair) => keyValuePair[1] === mainPanelContent
  )
  // activePanel is array of form [string, ID]
  // The trip planner has id null
  const activePanel = (activePanelPair && activePanelPair[1]) || null

  return {
    activePanel
  }
}

const mapDispatchToProps = {
  setMainPanelContent
}

export default withRouter(
  // @ts-expect-error TODO: figure out what's going on here
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(ViewSwitcher))
)
