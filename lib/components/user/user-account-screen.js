import clone from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'

import { routeTo } from '../../actions/ui'
import { addOrUpdateUser } from '../../actions/user'
import AppNav from '../app/app-nav'

import AccountSetupFinishPane from './account-setup-finish-pane'
import ExistingAccountDisplay from './existing-account-display'
import FavoriteLocationsPane from './favorite-locations-pane'
import NewAccountWizard from './new-account-wizard'
import NotificationPrefsPane from './notification-prefs-pane'
import PhoneVerificationPane from './phone-verification-pane'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailScreen from './verify-email-screen'
import withLoggedInUserSupport from './with-logged-in-user-support'

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

    // TODO: Find a better place for this.
    if (!isNewAccount && skipIfExistingUser) {
      // Return to originalUrl and prevent the URL from showing in browsing history
      window.location.replace(window.location.href.replace('#/account/welcome', `#${originalUrl}`))
    }

    this.state = {
      // Deep clone current user state to make edits.
      userData: clone(loggedInUser)
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
    // TODO: Change state of Save button while the update action takes place.

    const { addOrUpdateUser } = this.props
    const { userData } = this.state
    await addOrUpdateUser(userData)

    // TODO: Handle UI feedback (currently an alert inside addOrUpdateUser).
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
    const isNewAccount = !loggedInUser.hasConsentedToTerms
    const { user } = auth

    let formContents
    if (isNewAccount) {
      if (!user.email_verified) {
        // Check and prompt for email verification first to avoid extra user wait.
        formContents = <VerifyEmailScreen />
      } else {
        formContents = (
          <NewAccountWizard
            onComplete={this._handleExitAndSave}
            panes={this._panes}
            userData={userData}
          />
        )
      }
    } else {
      formContents = (
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
          {formContents}
        </form>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    accessToken: state.user.accessToken,
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  addOrUpdateUser,
  routeTo
}

export default withLoggedInUserSupport(
  withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen)),
  true
)
