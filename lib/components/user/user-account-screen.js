import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { addUser, fetchUser, updateUser } from '../../util/middleware'
import { routeTo } from '../../actions/ui'
import { setCurrentUser } from '../../actions/user'
import AppNav from '../app/app-nav'

import AccountSetupFinishPane from './account-setup-finish-pane'
import AwaitingScreen from './awaiting-screen'
import ExistingAccountDisplay from './existing-account-display'
import FavoriteLocationsPane from './favorite-locations-pane'
import NewAccountWizard from './new-account-wizard'
import NotificationPrefsPane from './notification-prefs-pane'
import PhoneVerificationPane from './phone-verification-pane'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailScreen from './verify-email-screen'
import { withLoginRequired } from 'use-auth0-hooks'

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
 * This screen handles creating/updating OTP user account settings.
 */
class UserAccountScreen extends Component {
  static propTypes = {
    originalUrl: PropTypes.string
  }

  static defaultProps = {
    originalUrl: '/'
  }

  constructor (props) {
    super(props)

    this.state = {
      isNewAccount: true,
      userData: null
    }
  }

  _fetchUserData = async () => {
    const {
      auth,
      originalUrl,
      persistence,
      setCurrentUser,
      skipIfExistingUser
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

      const isNewAccount = result.status === 'error' || (result.data && result.data.result === 'ERR')

      if (!isNewAccount && skipIfExistingUser) {
        setCurrentUser(result.data)
        // Return to originalUrl and prevent the URL from showing in browsing history
        window.location.replace(window.location.href.replace('#/account/welcome', `#${originalUrl}`))
      } else {
        // TODO: Set application state (so that user data is fetched once only... until logout happens).
        const userData = isNewAccount ? getStateForNewUser(auth.user) : result.data
        if (userData.savedLocations === null) userData.savedLocations = []

        this.setState({
          isNewAccount,
          userData
        })

        setCurrentUser(userData)
      }
    } catch (error) {
      // TODO: improve error handling.
      alert(`An error was encountered:\n${error}`)
    }
  }

  _updateUserState = newUserData => {
    const { userData } = this.state
    this.setState({
      userData: {
        ...userData,
        ...newUserData
      }
    })
  }

  _updateUserPrefs = async () => {
    const { auth, persistence, setCurrentUser } = this.props

    if (persistence && persistence.otp_middleware) {
      const { accessToken } = auth
      const { isNewAccount, userData } = this.state

      // TODO: Change state of Save button.

      let result
      if (isNewAccount) {
        result = await addUser(persistence.otp_middleware, accessToken, userData)
      } else {
        result = await updateUser(persistence.otp_middleware, accessToken, userData)
      }

      // TODO: improve this.
      if (result.status === 'success' &&
          result.data && result.data.auth0UserId) {
        // Update application state
        const userData = result.data
        setCurrentUser(userData)

        alert('Your preferences have been saved.')
      } else {
        alert(`An error was encountered:\n${JSON.stringify(result)}`)
      }
    }
  }

  _handleExit = () => {
    const { originalUrl } = this.props
    this.props.routeTo(originalUrl)
  }

  _handleExitAndSave = async () => {
    await this._updateUserPrefs()
    this._handleExit()
  }

  /**
   * Hook userData, onUserDataChange on some panes upon rendering.
   * This returns a new render function for the passed component
   * that allows passing other props to it later if needed.
   */
  _hookUserData = Pane => props => {
    const { userData } = this.state
    return (
      <Pane
        onUserDataChange={this._updateUserState}
        userData={userData}
        {...props}
      />
    )
  }

  // Make an index of pane components, so we don't render all panes at once on every render.
  // Hook some panes the userData and onUserDataChange props.
  _panes = {
    terms: this._hookUserData(TermsOfUsePane),
    notifications: this._hookUserData(NotificationPrefsPane),
    verifyPhone: PhoneVerificationPane,
    locations: this._hookUserData(FavoriteLocationsPane),
    finish: AccountSetupFinishPane
  }

  async componentDidMount () {
    await this._fetchUserData()

    // TODO: Update title bar.
  }

  render () {
    const { auth } = this.props
    const { user } = auth
    const {
      isNewAccount,
      userData
    } = this.state

    if (!userData) {
      // Display a hint while fetching user data (from componentDidMount).
      return <AwaitingScreen />
    }

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <AppNav />
        <form className='container'>
          {(isNewAccount
            ? (!user.email_verified
              ? (
                // Check and prompt for email verification first to avoid extra user wait.
                <VerifyEmailScreen />
              )
              : (
                <NewAccountWizard
                  onComplete={this._handleExitAndSave}
                  panes={this._panes}
                  userData={userData}
                />
              )
            )
            : (
              <ExistingAccountDisplay
                onCancel={this._handleExit}
                onComplete={this._handleExitAndSave}
                panes={this._panes}
              />
            )
          )}
        </form>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    persistence: state.otp.config.persistence
  }
}

const mapDispatchToProps = {
  routeTo,
  setCurrentUser
}

export default withLoginRequired(
  connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen)
)
