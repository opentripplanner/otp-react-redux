import React, { Component } from 'react'
import { connect } from 'react-redux'

import { routeTo } from '../../actions/ui'
import { setCurrentUser } from '../../actions/user'
import { fetchUser } from '../../util/middleware'
import { renderChildrenWithProps } from '../../util/ui'

import AwaitingScreen from './awaiting-screen'

function getStateForNewUser (auth0User) {
  return {
    auth0UserId: auth0User.sub,
    email: auth0User.email,
    hasConsentedToTerms: false, // User must agree to terms.
    isEmailVerified: auth0User.email_verified,
    notificationChannel: 'email',
    phoneNumber: '',
    recentLocations: [],
    savedLocations: [],
    storeTripHistory: false // User must opt in.
  }
}

/**
 * This screen is flashed any time there is a need,
 * to ensure that state.otp.user.loggedInUser is set.
 */
class UserLoaderScreen extends Component {
  _fetchUserData = async () => {
    const {
      auth,
      persistence,
      setCurrentUser
    } = this.props

    try {
      const result = await fetchUser(
        persistence.otp_middleware,
        auth.accessToken,
        auth.user.sub
      )

      // Beware! On AWS, for a nonexistent user, the call above will return, for example:
      // {
      //    status: 'success',
      //    data: {
      //      "result": "ERR",
      //      "message": "No user with auth0UserId=000000 found.",
      //      "code": 404,
      //      "detail": null
      //    }
      // }
      //
      // On direct middleware interface, for a nonexistent user, the call above will return:
      // {
      //    status: 'error',
      //    message: 'Error get-ing user...'
      // }
      // TODO: Improve AWS response.

      const resultData = result.data
      const isNewAccount = result.status === 'error' || (resultData && resultData.result === 'ERR')

      if (!isNewAccount) {
        // TODO: Move next line somewhere else.
        if (resultData.savedLocations === null) resultData.savedLocations = []
        setCurrentUser(resultData)
      } else {
        setCurrentUser(getStateForNewUser(auth.user))
      }
    } catch (error) {
      // TODO: improve error handling.
      alert(`An error was encountered:\n${error}`)
    }
  }

  async componentDidMount () {
    await this._fetchUserData()
  }

  render () {
    const { auth, loggedInUser } = this.props

    if (!loggedInUser) {
      // Display a hint while fetching user data (from componentDidMount).
      return <AwaitingScreen />
    } else {
      const { children } = this.props
      return renderChildrenWithProps(children, { auth })
    }
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.otp.user.loggedInUser,
    persistence: state.otp.config.persistence
  }
}

const mapDispatchToProps = {
  routeTo,
  setCurrentUser
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLoaderScreen)
