import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { useHistory, withRouter } from 'react-router'
import React from 'react'

import { MainPanelContent, setMainPanelContent } from '../../actions/ui'

type Props = {
  accountsActive: boolean
  activePanel: number
  intl: IntlShape
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
  intl,
  setMainPanelContent,
  sticky
}: Props) => {
  const history = useHistory()

  const _showRouteViewer = () => {
    setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
  }

  const _showTripPlanner = () => {
    if (accountsActive) {
      // Go up to root while preserving query parameters
      history.push('..' + history.location.search)
    } else {
      setMainPanelContent(null)
    }
  }

  return (
    <div
      aria-label={intl.formatMessage({
        id: 'components.ViewSwitcher.switcher'
      })}
      className="view-switcher"
      role="navigation"
      // @ts-expect-error TS doesn't like false as a style
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
        bsStyle="link"
        // @ts-expect-error TS doesn't like false as a style
        className={activePanel === null && !accountsActive && 'active'}
        onClick={_showTripPlanner}
      >
        <FormattedMessage id="components.BatchRoutingPanel.shortTitle" />
      </Button>
      <Button
        bsStyle="link"
        // @ts-expect-error TS doesn't like false as a style
        className={activePanel === MainPanelContent.ROUTE_VIEWER && 'active'}
        onClick={_showRouteViewer}
      >
        <FormattedMessage id="components.RouteViewer.shortTitle" />
      </Button>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state: any) => {
  const { mainPanelContent } = state.otp.ui

  // Reverse the ID to string mapping
  let activePanel: any = Object.entries(MainPanelContent).find(
    (keyValuePair) => keyValuePair[1] === mainPanelContent
  )
  // activePanel is array of form [string, ID]
  // The trip planner has id null
  activePanel = (activePanel && activePanel[1]) || null

  return {
    accountsActive: state.router.location.pathname.includes('/account'),
    activePanel
  }
}

const mapDispatchToProps = {
  setMainPanelContent
}

export default withRouter(
  // @ts-expect-error TODO: not sure why this is failing, it works.
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(ViewSwitcher))
)
