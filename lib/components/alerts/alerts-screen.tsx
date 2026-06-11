import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
import React, { Component } from 'react'

import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import AppFrame from '../app/app-frame'
import PageTitle from '../util/page-title'
import SubNav from '../user/sub-nav'

interface Props {
  intl: IntlShape
}

class AlertsScreen extends Component<Props> {
  static contextType = ComponentContext

  render() {
    const { alertsApi, AlertsViewer } = this.context
    return (
      <AppFrame
        SubNav={() => (
          <SubNav // maybe we want to make a custom subnav for alerts? For now, just reuse the existing one and hide the links.
            showLinks={false}
            title={this.props.intl.formatMessage({
              id: 'components.AlertsScreen.title'
            })}
          />
        )}
      >
        <PageTitle
          title={this.props.intl.formatMessage({
            id: 'components.AlertsScreen.title'
          })}
        />
        <AlertsViewer apiUrl={alertsApi} />
      </AppFrame>
    )
  }
}

// connect to the redux store

// ALERTS-TODO: alerts filter state and helper methods.
// see route-viewer.tsx for example.

// vars?: alerts, filter, modes, agencies, routes

const mapStateToProps = (state: AppReduxState) => {
  return {
    loggedInUser: state.user.loggedInUser
  }
}

// ALERTS-TODO: alerts filter actions.
// see route-viewer.tsx for example.

// actions?: setRouteViewerFilter, findRouteIfNeeded, findRoutesIfNeeded

/* const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser
} */

export default connect(
  mapStateToProps
  // mapDispatchToProps
)(injectIntl(AlertsScreen))
