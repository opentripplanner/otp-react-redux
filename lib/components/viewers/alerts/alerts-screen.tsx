import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
import React, { Component } from 'react'

import { AppReduxState } from '../../../util/state-types'
import AppFrame from '../../app/app-frame'
import PageTitle from '../../util/page-title'
import SubNav from '../../user/sub-nav'

interface Props {
  intl: IntlShape
  loggedInUser: any
}

class AlertsScreen extends Component<Props> {
  render() {
    return (
      <AppFrame
        SubNav={() => (
          <SubNav
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
      </AppFrame>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  return {
    loggedInUser: state.user.loggedInUser
  }
}

/* const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser
} */

export default connect(
  mapStateToProps
  // mapDispatchToProps
)(injectIntl(AlertsScreen))
