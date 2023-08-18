import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'

import * as uiActions from '../../actions/ui'
import { MainPanelContent } from '../../actions/ui-constants'

type Props = {
  accountsActive: boolean
  activePanel: number | null
  setMainPanelContent: (payload: number | null) => void
  sticky?: boolean
}
/**
 * This component is a switcher between
 * the main views of the application.
 */
const ViewSwitcher = ({
  accountsActive,
  activePanel,
  setMainPanelContent,
  sticky
}: Props) => {
  const intl = useIntl()

  const _showRouteViewer = () => {
    setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
  }

  const _showTripPlanner = () => {
    // setMainPanelContent(null) already includes navigation to '/'.
    setMainPanelContent(null)
  }

  const tripPlannerActive = activePanel === null && !accountsActive
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
        bsStyle="link"
        className={`${tripPlannerActive ? 'active' : ''}`}
        onClick={_showTripPlanner}
      >
        <FormattedMessage id="components.BatchRoutingPanel.shortTitle" />
      </Button>
      <Button
        aria-controls="view-switcher"
        bsStyle="link"
        className={`${routeViewerActive ? 'active' : ''}`}
        onClick={_showRouteViewer}
      >
        <FormattedMessage id="components.RouteViewer.shortTitle" />
      </Button>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state: any) => {
  return {
    // TODO: more reliable way of detecting these things, such as terms of storage page
    accountsActive: state.router.location.pathname.includes('/account'),
    activePanel: state.otp.ui.mainPanelContent
  }
}

const mapDispatchToProps = {
  setMainPanelContent: uiActions.setMainPanelContent
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewSwitcher)
