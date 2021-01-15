import * as routerActions from 'connected-react-router'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import * as uiActions from '../../actions/ui'
import Loading from '../narrative/loading'
import { CREATE_ACCOUNT_PATH } from '../../util/constants'
import { isNewUser } from '../../util/user'
import withLoggedInUserSupport from './with-logged-in-user-support'

/**
 * This screen is flashed just after user sign in while state.user.loggedInUser is being fetched.
 * Once state.user.loggedInUser is available:
 * - For new users, route them to the account page (it will show account setup).
 *   while trying to preserve the search portion of the URL before login.
 * - For existing users, simply take them to the route (itinerary search, stop/trip viewer) that was in place before login.
 *
 * Rerouting is performed so that the current URL does not appear in the browser history.
 */
class AfterSignInScreen extends Component {
  componentDidUpdate () {
    const { loggedInUser, replace, routeTo, pathBeforeSignIn } = this.props

    // Redirect when loggedInUser is populated (i.e. after several calls to componentDidUpdate())
    if (loggedInUser) {
      if (isNewUser(loggedInUser)) {
        const previousSearch = pathBeforeSignIn && pathBeforeSignIn.split('?')[1]
        const newSearch = previousSearch ? `?${previousSearch}` : null // if not null, must include '?'.
        routeTo(CREATE_ACCOUNT_PATH, newSearch, routerActions.replace)
      } else {
        replace(pathBeforeSignIn)
      }
    }
  }

  render () {
    return (
      <div className='text-center' style={{marginTop: '150px'}}>
        <Loading />
        <p style={{marginTop: '25px'}}>Redirecting...</p>
        <p>If the page does not load after a few seconds, <Link to='/'>click here</Link>.</p>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { loggedInUser, pathBeforeSignIn } = state.user
  return {
    loggedInUser,
    pathBeforeSignIn
  }
}

const mapDispatchToProps = {
  replace: routerActions.replace,
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  connect(mapStateToProps, mapDispatchToProps)(AfterSignInScreen)
)
