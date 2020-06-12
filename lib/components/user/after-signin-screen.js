import { replace } from 'connected-react-router'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'

import * as uiActions from '../../actions/ui'
import { isNewUser } from '../../util/user'
import withLoggedInUserSupport from './with-logged-in-user-support'

/**
 * This screen is flashed just after user sign in while state.user.loggedInUser is being fetched.
 * Once state.user.loggedInUser is available:
 * - For new users, route them to the account page (it will show account setup).
 * - For existing users, route them to the itinerary search that was in place before login.
 *   TODO: route them to the path (not just '/') that was in place before login.
 */
class AfterSignInScreen extends Component {
  componentDidUpdate () {
    const { loggedInUser, routeTo } = this.props

    // It will take several calls to componentDidUpdate() before loggedInUser becomes available.
    if (loggedInUser) {
      const nextPath = isNewUser(loggedInUser) ? '/account' : '/'

      // Reroute and prevent the current URL from showing in the browser history.
      routeTo(nextPath, null, replace)
    }
  }

  render () {
    return (
      <div>
        <h1>Signed In...
          <br />
          <FontAwesome
            name='hourglass-half'
            size='4x'
          />
        </h1>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  connect(mapStateToProps, mapDispatchToProps)(AfterSignInScreen)
)
