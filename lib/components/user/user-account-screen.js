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
import PhoneVerificationPane from './phone-verification-pane'
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
      // Capture whether user is a new user here and retain that value as long as this screen is active.
      // (When a new user progresses through the account steps, isNewUser(loggedInUser) will change to false.)
      isNewUser: isNewUser(props.loggedInUser),

      // Work on a copy of the logged-in user data.
      userData: clone(props.loggedInUser)
    }
  }

  /**
   * Updates state.userData with new data (can be just one prop or the entire user record).
   */
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

    const { createOrUpdateUser } = this.props
    const { userData } = this.state
    await createOrUpdateUser(userData)

    // FIXME: do not show confirmation message in wizard mode.

    // TODO: Handle UI feedback (currently an alert() dialog inside createOrUpdateUser).
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

  componentDidUpdate (prevProps) {
    // If the loggedInUser record has been updated while this screen is shown
    // (e.g. when a new user clicks next after agreeing on terms),
    // then update the working copy in state.userData with the latest
    // Changes in the previous working copy will be discarded (hopefully, there are none).
    const { loggedInUser } = this.props

    if (!isEqual(prevProps.loggedInUser, loggedInUser)) {
      this._updateUserState(loggedInUser)
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
            onCreate={this._updateUserPrefs}
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
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen)),
  true
)
