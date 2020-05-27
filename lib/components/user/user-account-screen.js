import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'

import { addUser, updateUser } from '../../util/middleware'
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

    const { loggedInUser, originalUrl, skipIfExistingUser } = props
    const isNewAccount = !loggedInUser.hasConsentedToTerms

    // TODO: Foind a better place for this.
    if (!isNewAccount && skipIfExistingUser) {
      // Return to originalUrl and prevent the URL from showing in browsing history
      window.location.replace(window.location.href.replace('#/account/welcome', `#${originalUrl}`))
    }

    this.state = {
      // Deep clone current user state to make edits.
      userData: JSON.parse(JSON.stringify(loggedInUser))
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
    const { auth, loggedInUser, persistence, setCurrentUser } = this.props

    if (persistence && persistence.otp_middleware) {
      const { accessToken } = auth
      const { userData } = this.state
      const isNewAccount = !loggedInUser.hasConsentedToTerms

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

  // TODO: Update title bar during componentDidMount.

  render () {
    const { auth, loggedInUser } = this.props
    const { userData } = this.state

    if (!userData) {
      return <AwaitingScreen />
    }

    const isNewAccount = !loggedInUser.hasConsentedToTerms
    const { user } = auth

    let content
    if (isNewAccount) {
      if (!user.email_verified) {
        // Check and prompt for email verification first to avoid extra user wait.
        content = <VerifyEmailScreen />
      } else {
        content = (
          <NewAccountWizard
            onComplete={this._handleExitAndSave}
            panes={this._panes}
            userData={userData}
          />
        )
      }
    } else {
      content = (
        <ExistingAccountDisplay
          onCancel={this._handleExit}
          onComplete={this._handleExitAndSave}
          panes={this._panes}
        />
      )
    }

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <AppNav />
        <form className='container'>
          {content}
        </form>
      </div>
    )
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

export default withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen))
