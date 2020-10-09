import { withAuth0 } from '@auth0/auth0-react'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as userActions from '../../actions/user'
import { AUTH0_AUDIENCE, AUTH0_SCOPE } from '../../util/constants'
import { renderChildrenWithProps } from '../../util/ui'
import AwaitingScreen from './awaiting-screen'

/**
 * This higher-order component ensures that state.user is loaded
 * in the redux store for any wrapped component that may need it.
 * The requireLoggedInUser argument handles the two use cases for this component:
 * - Some components (e.g. those processing a user account) require a logged in user to be available,
 *   and without it they cannot function.
     For such components, set requireLoggedInUser to true.
 *   An awaiting screen will be displayed while state.user data are being fetched,
 *   and the wrapped component will be shown upon availability of state.user.
 * - Other components (e.g. landing pages) don't require a logged in user to be available to function
 *   but will display extra functionality if so.
 *   For such components, omit requireLoggedInUser parameter (or set to false).
 *   The wrapped component is shown immediately, and no awaiting screen is displayed while state.user is being retrieved.
 * @param {React.Component} WrappedComponent The component to be wrapped to that uses state.user from the redux store.
 * @param {boolean} requireLoggedInUser Whether the wrapped component requires state.user to properly function.
 */
export default function withLoggedInUserSupport (WrappedComponent, requireLoggedInUser) {
  return props => (
    <UserLoaderScreenWithAuth requireLoggedInUser={requireLoggedInUser}>
      <WrappedComponent {...props} />
    </UserLoaderScreenWithAuth>
  )
}

/**
 * This component ensures that values under state.user are set when a user is logged in.
 * If needed by the children, this component displays a wait screen while state.user values are being fetched.
 * Upon completion (or if no user is logged in or if auth is disabled), it renders children.
 */
class UserLoaderScreen extends Component {
  /**
   * Determines whether user data should be fetched.
   * @returns true if the logged-in user has passed Auth0 authentication
   *   and state.user.loggedInUser has not been set; false otherwise.
   */
  loggedInUserIsUnfetched = () => {
    const { auth0, loggedInUser } = this.props
    return auth0 && auth0.isAuthenticated && !loggedInUser
  }

  async componentDidUpdate () {
    const { auth0, fetchOrInitializeUser } = this.props

    if (this.loggedInUserIsUnfetched()) {
      fetchOrInitializeUser(auth0)
    }
  }

  render () {
    const { auth0, children, requireLoggedInUser } = this.props

    if (requireLoggedInUser && this.loggedInUserIsUnfetched()) {
      // If a logged-in user is required, then
      // display a hint while the logged-in user data is being fetched (from componentDidMount).
      // Don't display this if loggedInUser is not required or is already available.
      // TODO: Improve this screen.
      return <AwaitingScreen />
    } else if (auth0) {
      // When the logged-in user is fetched, forward the auth0 object to children.
      return renderChildrenWithProps(children, { auth0 })
    }

    return children
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  fetchOrInitializeUser: userActions.fetchOrInitializeUser
}

const UserLoaderScreenWithAuth = withAuth0(
  connect(mapStateToProps, mapDispatchToProps)(UserLoaderScreen),
  {
    audience: AUTH0_AUDIENCE,
    scope: AUTH0_SCOPE
  }
)
