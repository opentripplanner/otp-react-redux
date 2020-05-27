import PropTypes from 'prop-types'
import { Component } from 'react'

import { renderChildrenWithProps } from '../../util/ui'

import AwaitingScreen from './awaiting-screen'

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
      accessToken: null
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

  componentDidMount () {
    const { auth } = this.props
    if (auth.isAuthenticated) {
      this._fetchToken()
    }
  }

  componentWillUnmount () {
    // Stop trying to get a token.
    clearInterval(this._tokenTimer)
  }

  render () {
    const { auth, children } = this.props
    const token = auth.accessToken || this.state.accessToken

    if (auth.isAuthenticated && !token) {
      // Display a wait screen while waiting for token for a logged in user.
      return <AwaitingScreen />
    }

    const authProp = {
      ...auth,
      accessToken: token
    }
    return renderChildrenWithProps(children, { authProp })
  }
}

export default Auth0TokenWrapper
