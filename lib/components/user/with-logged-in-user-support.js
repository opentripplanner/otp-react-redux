/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withAuth0 } from '@auth0/auth0-react'
import React, { Component } from 'react'

import * as userActions from '../../actions/user'
import { AUTH0_AUDIENCE, AUTH0_SCOPE } from '../../util/constants'

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
 * @param {React.ComponentType<WithAuth0Props>} WrappedComponent The component to be wrapped to that uses state.user from the redux store.
 * @param {boolean} requireLoggedInUser Whether the wrapped component requires state.user to properly function.
 */
export default function withLoggedInUserSupport(
  WrappedComponent,
  requireLoggedInUser
) {
  return (props) => (
    <UserLoaderScreenWithAuth
      passedProps={props}
      requireLoggedInUser={requireLoggedInUser}
      WrappedComponent={WrappedComponent}
    />
  )
}

/**
 * This component ensures that values under state.user are set when a user is logged in.
 * If needed by the child WrappedComponent, this component displays a wait screen while state.user values are being fetched.
 * Upon completion (or if no user is logged in or if auth is disabled), it renders the
 * specified WrappedComponent with the passed props and the auth0 props if available.
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

  /**
   * Determines whether an auth0 token should be fetched.
   * @returns true if the logged-in user has passed Auth0 authentication
   *   and state.user.accessToken has not been set; false otherwise.
   */
  acccessTokenIsUnfetched = () => {
    const { accessToken, auth0 } = this.props
    return auth0 && auth0.isAuthenticated && !accessToken
  }

  componentDidMount() {
    const { auth0, fetchAuth0Token, intl } = this.props
    if (this.acccessTokenIsUnfetched()) {
      fetchAuth0Token(auth0, intl)
    }
  }

  componentDidUpdate() {
    const { auth0, fetchAuth0Token, fetchOrInitializeUser, intl } = this.props

    if (this.acccessTokenIsUnfetched()) {
      fetchAuth0Token(auth0, intl)
    } else if (this.loggedInUserIsUnfetched()) {
      fetchOrInitializeUser(auth0.user)
    }
  }

  render() {
    const { auth0, passedProps, requireLoggedInUser, WrappedComponent } =
      this.props

    if (requireLoggedInUser && this.loggedInUserIsUnfetched()) {
      // If a logged-in user is required, then
      // display a hint while the logged-in user data is being fetched (from componentDidMount).
      // Don't display this if loggedInUser is not required or is already available.
      // TODO: Improve this screen.
      return <AwaitingScreen />
    }

    // Forward the auth0 object to the wrapped component.
    // (if there is no user, auth0 will be null and not be forwarded.)
    return <WrappedComponent auth0={auth0} {...passedProps} />
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  const { accessToken, loggedInUser } = state.user
  return {
    accessToken,
    loggedInUser
  }
}

const mapDispatchToProps = {
  fetchAuth0Token: userActions.fetchAuth0Token,
  fetchOrInitializeUser: userActions.fetchOrInitializeUser
}

const UserLoaderScreenWithAuth = withAuth0(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserLoaderScreen)),
  {
    audience: AUTH0_AUDIENCE,
    scope: AUTH0_SCOPE
  }
)
