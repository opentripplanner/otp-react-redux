import PropTypes from 'prop-types'
import { Component } from 'react'

import { renderChildrenWithProps } from '../../util/ui'

import AwaitingScreen from './awaiting-screen'

/**
 * This screen handles creating/updating OTP user accoun settings.
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

  _fetchToken = () => {
    /**
     * An Auth0 access token, required to call the middleware API,
     * is typically not available right away when this function is called.
     * So, we set up a timer to poll for an accessToken from the props every second.
     * Once the token is available, update state so token can be forwarded to children.
     * While we wait for the token, display a wait screen.
     */
    this._tokenTimer = setInterval(async () => {
      const { auth } = this.props
      const { accessToken } = auth
      if (accessToken) {
        clearInterval(this._tokenTimer)
        this.setState({ accessToken })
      }
    }, 1000)
  }

  componentDidMount () {
    this._fetchToken()
  }

  render () {
    const { auth, children } = this.props
    const token = auth.accessToken || this.state.accessToken

    if (!token) {
      // Display a wait screen while waiting for token.
      return <AwaitingScreen />
    }

    // console.log(token)

    const authProp = {
      ...auth,
      accessToken: token
    }
    return renderChildrenWithProps(children, { authProp })
  }
}

export default Auth0TokenWrapper
