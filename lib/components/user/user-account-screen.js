import clone from 'lodash/cloneDeep'
import isEqual from 'lodash.isequal'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { isNewUser } from '../../util/user'
import DesktopNav from '../app/desktop-nav'
import AccountSetupFinishPane from './account-setup-finish-pane'
import ExistingAccountDisplay from './existing-account-display'
import FavoriteLocationsPane from './favorite-locations-pane'
import NewAccountWizard from './new-account-wizard'
import NotificationPrefsPane from './notification-prefs-pane'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailScreen from './verify-email-screen'
import withLoggedInUserSupport from './with-logged-in-user-support'

/**
 * This screen handles creating/updating OTP user account settings.
 */
class UserAccountScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      // Capture whether user is a new user at this stage, and retain that value as long as this screen is active.
      // Reminder: When a new user progresses through the account steps,
      // isNewUser(loggedInUser) will change to false as the database gets updated.
      isNewUser: isNewUser(props.loggedInUser),

      // Last number and last time we requested a code for (to avoid sending SMS over and over to verify the same number).
      lastPhoneNumberRequested: null,
      lastPhoneRequestTime: null,

      // Previous phone verification status
      // if the user needs to revert their phone number in the middle of the verification process.
      previousIsPhoneNumberVerified: null,

      // Previous phone number if the user needs to revert it in the middle of the verification process.
      previousPhoneNumber: null,

      // Work on a copy of the logged-in user data captured when this component is created.
      userData: clone(props.loggedInUser)
    }
  }

  /**
   * Updates state.userData with new data (can be just one prop or the entire user record).
   */
  _updateUserState = newUserData => {
    const { previousPhoneNumber, userData } = this.state
    const { isPhoneNumberVerified, phoneNumber } = this.props.loggedInUser

    // If the phone number changed from the original and none was previously recorded, then
    // save the original number and verification status.
    if (newUserData.phoneNumber !== phoneNumber && !previousPhoneNumber) {
      this.setState({
        previousIsPhoneNumberVerified: isPhoneNumberVerified,
        previousPhoneNumber: phoneNumber
      })
    }

    // Update the copy of user's data being edited.
    this.setState({
      userData: {
        ...userData,
        ...newUserData
      }
    })
  }

  _updateUserPrefs = async (silentOnSucceed = false) => {
    // TODO: Change state of Save button while the update action takes place.

    const { createOrUpdateUser } = this.props
    const { userData } = this.state

    await createOrUpdateUser(userData, silentOnSucceed)

    // TODO: Handle UI feedback (currently an alert() dialog inside createOrUpdateUser).
  }

  _handleCreateNewUser = async () => {
    await this._updateUserPrefs(true)
  }

  _handleExit = () => {
    // On exit, route to default search route.
    this.props.routeTo('/')
  }

  _handleExitAndSave = async () => {
    await this._updateUserPrefs()
    this._handleExit()
  }

  /**
   * Reverts the user phone number and verification state in the database.
   */
  _handleRevertPhoneNumber = () => {
    // FIXME: This assumes the pending phone number must be saved in the database prior to verification.
    const { createOrUpdateUser, loggedInUser } = this.props

    // Make a clone of the original userData object.
    const userData = clone(loggedInUser)
    userData.phoneNumber = this.state.previousPhoneNumber
    userData.isPhoneNumberVerified = this.state.previousIsPhoneNumberVerified

    createOrUpdateUser(userData, true)
  }

  /**
   * Requests a phone verification code.
   * This handler is called when the user clicks "Verify my phone" after entering a new number,
   * and also when the user clicks "Request a new code" from the verification modal.
   */
  _handleRequestPhoneVerificationCode = async () => {
    const { lastPhoneNumberRequested, lastPhoneRequestTime, userData } = this.state
    const { phoneNumber } = userData
    const timestamp = new Date()

    // Request a new verification code if we are requesting a different number.
    // or enough time has ellapsed since the last request (1 minute?).
    if (lastPhoneNumberRequested !== phoneNumber ||
        (lastPhoneRequestTime && lastPhoneRequestTime <= timestamp + 60000)) {
      this.setState({
        lastPhoneNumberRequested: phoneNumber,
        lastPhoneRequestTime: timestamp
      })

      // Use the original user data to avoid persisting any other pending edits.
      await this.props.requestPhoneVerificationCode(this.props.loggedInUser, phoneNumber)
    }
  }

  /**
   * Sends the phone verification code.
   */
  _handleSendPhoneVerificationCode = async code => {
    // Use the original user data to avoid persisting any other pending edits.
    await this.props.sendPhoneVerificationCode(this.props.loggedInUser, code)

    // state.user.isPhoneNumberVerified will be set to true on success.
    // Clear previous phone number and state if phone is verified.
    if (this.props.loggedInUser.isPhoneNumberVerified) {
      this.setState({ previousPhoneNumber: null, previousIsPhoneNumberVerified: null })
    }
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
    locations: this._hookUserData(FavoriteLocationsPane),
    finish: AccountSetupFinishPane
  }

  componentDidUpdate (prevProps) {
    // We need to update some fields, but not erase the user's other pending changes
    // when the loggedInUser record has been updated while this screen is shown, e.g.:
    // - when a new user clicks next after agreeing on terms,
    // - when the phone verification status changes (this is a middleware constraint).
    const { loggedInUser } = this.props
    if (!isEqual(prevProps.loggedInUser, loggedInUser)) {
      const { id, isPhoneNumberVerified, notificationChannel, phoneNumber } = loggedInUser
      this._updateUserState({
        id,
        isPhoneNumberVerified,
        notificationChannel,
        phoneNumber
      })

      // Clear previous phone states if values are identical to the ones set above.
      if (phoneNumber === this.state.previousPhoneNumber) {
        this.setState({
          previousIsPhoneNumberVerified: null,
          previousPhoneNumber: null
        })
      }
    }
  }

  // TODO: Update title bar during componentDidMount.

  render () {
    const { auth } = this.props
    const { isNewUser, userData } = this.state

    let formContents
    if (isNewUser) {
      if (!auth.user.email_verified) {
        // Check and prompt for email verification first to avoid extra user wait.
        formContents = <VerifyEmailScreen />
      } else {
        // New users are shown "wizard" (step-by-step) mode
        // (includes when a "new" user clicks 'My Account' from the account menu in the nav bar).
        formContents = (
          <NewAccountWizard
            onComplete={this._handleExitAndSave}
            onCreate={this._handleCreateNewUser}
            onRequestPhoneVerificationCode={this._handleRequestPhoneVerificationCode}
            onRevertUserPhoneNumber={this._handleRevertPhoneNumber}
            onSendPhoneVerificationCode={this._handleSendPhoneVerificationCode}
            panes={this._panes}
            userData={userData}
          />
        )
      }
    } else {
      formContents = (
        // Existing users are shown all panes together.
        <ExistingAccountDisplay
          onCancel={this._handleExit}
          onComplete={this._handleExitAndSave}
          onRequestPhoneVerificationCode={this._handleRequestPhoneVerificationCode}
          onRevertUserPhoneNumber={this._handleRevertPhoneNumber}
          onSendPhoneVerificationCode={this._handleSendPhoneVerificationCode}
          panes={this._panes}
        />
      )
    }

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
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
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  requestPhoneVerificationCode: userActions.requestPhoneVerificationCode,
  routeTo: uiActions.routeTo,
  sendPhoneVerificationCode: userActions.sendPhoneVerificationCode
}

export default withLoggedInUserSupport(
  withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen)),
  true
)
