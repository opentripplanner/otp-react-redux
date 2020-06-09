import React from 'react'
import { connect } from 'react-redux'

import { renderChildrenWithProps } from '../../util/ui'

import AwaitingScreen from './awaiting-screen'
import DiscreetProgressOverlay from './discreet-progress-overlay'

/**
 * This component obtains and passes an Auth0 accessToken prop to its children
 * (either from a passed auth prop or from the redux state).
 * It is needed to refresh the auth prop values. (For some reason, that does not happen from within the Auth0Wrapper component.)
 * The component does nothing (besides adding a null accessToken auth prop to children) if no user is logged in.
 */
const Auth0TokenWrapper = ({ auth, children, showAwaitingScreen, storedAccessToken }) => {
  const { accessToken, isAuthenticated } = auth
  const token = accessToken || storedAccessToken

  const authProp = {
    ...auth,
    accessToken: token
  }

  if (isAuthenticated && !token) {
    if (showAwaitingScreen) {
      // Display a wait screen, full-screen, while waiting for token for a logged in user.
      return <AwaitingScreen />
    } else {
      // HACK: Display a discreet UI element.
      // (Must change the DOM, even with something invisible, in order for children to mount and related actions to execute.)
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

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    storedAccessToken: state.otp.user.accessToken
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth0TokenWrapper)
