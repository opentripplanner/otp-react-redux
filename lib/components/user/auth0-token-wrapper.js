import PropTypes from 'prop-types'
import { Component } from 'react'
import { connect } from 'react-redux'

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

  constructor (props) {
    super(props)

    this.state = {
      accessToken: props.accessToken
    }
  }

  /**
   * An Auth0 access token, required to call the middleware API,
   * is typically not available right away when this function is called.
   * So, we set up a timer to poll for an accessToken from the props every second.
   * Once the token is available, update state so token can be forwarded to children.
   * While we wait for the token, display a wait screen.
   */
  _fetchToken = () => {
    this._tokenTimer = setInterval(() => {
      const { auth } = this.props
      const { accessToken } = auth
      if (accessToken) {
        clearInterval(this._tokenTimer)
        this.setState({ accessToken })
      }
    }, 1000)
  }

  _isAuthenticatedAndTokenless = () => {
    const { auth, isAuthenticated } = this.props
    const token = auth.accessToken || this.state.accessToken
    return isAuthenticated && !token
  }

  componentDidMount () {
    if (this._isAuthenticatedAndTokenless()) {
      this._fetchToken()
    }
  }

  componentWillUnmount () {
    // Stop trying to get a token.
    clearInterval(this._tokenTimer)
  }

  render () {
    const { auth, children, showAwaitingToken } = this.props
    const token = auth.accessToken || this.state.accessToken

    const authProp = {
      ...auth,
      accessToken: token
    }

    if (this._isAuthenticatedAndTokenless()) {
      // return <AwaitingScreen />

      if (showAwaitingToken) {
        // Display a wait screen, full-screen, while waiting for token for a logged in user.
        return <AwaitingScreen />
      } else {
        // HACK: Display a discreet UI element to show progress.
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

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    accessToken: state.otp.user.accessToken
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth0TokenWrapper)
