import PropTypes from 'prop-types'
import { Component } from 'react'

import { renderChildrenWithProps } from '../../util/ui'

import AwaitingScreen from './awaiting-screen'
import DiscreetProgressOverlay from './discreet-progress-overlay'

/**
 * This component obtains and passes an Auth0 accessToken prop to its children.
 * It is neeeded because an Auth0 token is typically not available right away
 * when rendering for the first time.
 * The component does nothing (besides adding a null accessToken prop) if no user is logged in.
 */
class Auth0TokenWrapper extends Component {
  static propTypes = {
    auth: PropTypes.any.isRequired
  }

  render () {
    const { auth, children, showAwaitingToken } = this.props
    const token = auth.accessToken

    const authProp = {
      ...auth,
      accessToken: token
    }

    if (auth.isAuthenticated && !token) {
      if (showAwaitingToken) {
        // Display a wait screen, full-screen, while waiting for token for a logged in user.
        return <AwaitingScreen />
      } else {
        // HACK: Display a discreet UI element.
        return (
          <>
            {renderChildrenWithProps(children, { authProp })}
            <DiscreetProgressOverlay />
          </>
        )
      }
    }

    return renderChildrenWithProps(children, { authProp })
  }
}

export default Auth0TokenWrapper
