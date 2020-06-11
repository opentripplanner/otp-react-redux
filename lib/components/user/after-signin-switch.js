import { replace } from 'connected-react-router'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { routeTo } from '../../actions/ui'
import { isNewUser } from '../../actions/user'

import AfterSignInScreen from './after-signin-screen'
import withLoggedInUserSupport from './with-logged-in-user-support'

/**
 * This screen is flashed just after user sign in while state.user.loggedInUser is fetched.
 * Once state.user.loggedInUser is available:
 * - For new users, route them to the account page (it will show account setup).
 * - For existing users, route them to the itinerary search that was in place before login.
 */
class AfterSignInSwitch extends Component {
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
    return <AfterSignInScreen />
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  routeTo
}

export default withLoggedInUserSupport(
  connect(mapStateToProps, mapDispatchToProps)(AfterSignInSwitch)
)
