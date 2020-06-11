import React, { Component } from 'react'
import { connect } from 'react-redux'

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
    const { loggedInUser } = this.props

    if (loggedInUser) {
      const nextUrl = isNewUser(loggedInUser) ? '/account' : '/'
      // Prevent the current URL from showing in the browser history.
      window.location.replace(window.location.href.replace('#/signedin', `#${nextUrl}`))
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
}

export default withLoggedInUserSupport(
  connect(mapStateToProps, mapDispatchToProps)(AfterSignInSwitch)
)
