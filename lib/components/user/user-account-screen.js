import { withAuthenticationRequired } from '@auth0/auth0-react'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as yup from 'yup'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import { cloneForEditing, isNewUser } from '../../util/user'
import DesktopNav from '../app/desktop-nav'
import AccountSetupFinishPane from './account-setup-finish-pane'
import ExistingAccountDisplay from './existing-account-display'
import NewAccountWizard from './new-account-wizard'
import NotificationPrefsPane from './notification-prefs-pane'
import FavoritePlacesPane from './places/favorite-places-pane'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailScreen from './verify-email-screen'
import withLoggedInUserSupport from './with-logged-in-user-support'

// The validation schema for the form fields.
const validationSchema = yup.object({
  email: yup.string().email(),
  hasConsentedToTerms: yup.boolean().oneOf([true], 'You must agree to the terms to continue.'),
  notificationChannel: yup.string().oneOf(['email', 'sms', 'none']),
  savedLocations: yup.array().of(yup.object({
    address: yup.string(),
    icon: yup.string(),
    type: yup.string()
  })),
  storeTripHistory: yup.boolean()
})

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
      isNewUser: isNewUser(props.loggedInUser)
    }
  }

  _updateUserPrefs = async (userData, silentOnSucceed = false) => {
    // TODO: Change state of Save button while the update action takes place.

    await this.props.createOrUpdateUser(userData, silentOnSucceed)

    // TODO: Handle UI feedback (currently an alert() dialog inside createOrUpdateUser).
  }

  /**
   * Silently persists the user data upon accepting terms.
   * Creating the user record before the user finishes the account creation steps
   * is required by the middleware in order to perform phone verification.
   *
   * @param {*} userData The user data state to persist.
   * @returns The new user id the the caller can use.
   */
  _handleCreateNewUser = userData => {
    this._updateUserPrefs(userData, true)
  }

  _handleExit = () => {
    // On exit, route to default search route.
    this.props.routeTo('/')
  }

  /**
   * Save changes and return to the planner.
   * @param {*} userData The user edited state to be saved, provided by Formik.
   */
  _handleSaveAndExit = async userData => {
    await this._updateUserPrefs(userData)
    this._handleExit()
  }

  // Make an index of pane components, so we don't render all panes at once on every render.
  _panes = {
    terms: TermsOfUsePane,
    notifications: NotificationPrefsPane,
    locations: FavoritePlacesPane,
    finish: AccountSetupFinishPane
  }

  // TODO: Update title bar during componentDidMount.

  render () {
    const {
      auth0,
      loggedInUser,
      phoneFormatOptions,
      requestPhoneVerificationSms,
      verifyPhoneNumber
    } = this.props

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
        <Formik
          // Force Formik to reload initialValues when we update them (e.g. user gets assigned an id).
          enableReinitialize
          initialValues={cloneForEditing(loggedInUser)}
          onSubmit={this._handleSaveAndExit}
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnChange={false}
          validateOnBlur
          validationSchema={validationSchema}
        >
          {
            // Formik props provide access to the current user data state and errors,
            // (in props.values, props.touched, props.errors)
            // and to its own blur/change/submit event handlers that automate the state.
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            formikProps => {
              let formContents
              let DisplayComponent
              if (this.state.isNewUser) {
                if (!auth0.user.email_verified) {
                  // Check and prompt for email verification first to avoid extra user wait.
                  formContents = <VerifyEmailScreen />
                } else {
                  // New users are shown "wizard" (step-by-step) mode
                  // (includes when a "new" user clicks "My Account" from the account menu in the nav bar).
                  DisplayComponent = NewAccountWizard
                }
              } else {
                // Existing users are shown all panes together.
                DisplayComponent = ExistingAccountDisplay
              }
              if (DisplayComponent) {
                formContents = (
                  <DisplayComponent
                    {...formikProps}
                    loggedInUser={loggedInUser}
                    onCancel={this._handleExit}
                    onCreate={this._handleCreateNewUser}
                    onRequestPhoneVerificationCode={requestPhoneVerificationSms}
                    onSendPhoneVerificationCode={verifyPhoneNumber}
                    panes={this._panes}
                    phoneFormatOptions={phoneFormatOptions}
                  />
                )
              }

              return (
                <Form className='container' noValidate>
                  {formContents}
                </Form>
              )
            }
          }
        </Formik>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user.loggedInUser,
    phoneFormatOptions: state.otp.config.phoneFormatOptions
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  requestPhoneVerificationSms: userActions.requestPhoneVerificationSms,
  routeTo: uiActions.routeTo,
  verifyPhoneNumber: userActions.verifyPhoneNumber
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
