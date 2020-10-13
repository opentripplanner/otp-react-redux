import clone from 'clone'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'
import * as yup from 'yup'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { isNewUser } from '../../util/user'
import DesktopNav from '../app/desktop-nav'
import AccountSetupFinishPane from './account-setup-finish-pane'
import ExistingAccountDisplay from './existing-account-display'
import FavoriteLocationsPane, { isHome, isWork } from './favorite-locations-pane'
import NewAccountWizard from './new-account-wizard'
import NotificationPrefsPane from './notification-prefs-pane'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailScreen from './verify-email-screen'
import withLoggedInUserSupport from './with-logged-in-user-support'

// Regex for phone numbers from https://stackoverflow.com/questions/52483260/validate-phone-number-with-yup/53210158#53210158
// https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s02.html
// FIXME: On merging with PR #224, remember to strip the non-numbers out and add +1 if there are only 10 digits.
const phoneRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/ // /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

// The validation schema for the form fields.
const validationSchema = yup.object({
  email: yup.string().email(),
  hasConsentedToTerms: yup.boolean().oneOf([true], 'You must agree to the terms to continue.'),
  notificationChannel: yup.string().oneOf(['email', 'sms', 'none']),
  phoneNumber: yup.string().matches(phoneRegExp, 'Phone number is not valid'),
  savedLocations: yup.array().of(yup.object({
    address: yup.string(),
    icon: yup.string(),
    type: yup.string()
  })),
  storeTripHistory: yup.boolean()
})

/**
 * Makes a copy of the logged-in user data for the Formik initial state,
 * with the 'home' and 'work' locations at the top of the savedLocations list
 * so they are always shown and shown at the top of the FavoriteLocationsPane.
 * Note: In the returned value, savedLocations is always a valid array.
 */
function cloneWithHomeAndWorkAsTopLocations (loggedInUser) {
  const clonedUser = clone(loggedInUser)
  const { savedLocations = [] } = clonedUser

  const homeLocation = savedLocations.find(isHome) || {
    address: '',
    icon: 'home',
    type: 'home'
  }
  const workLocation = savedLocations.find(isWork) || {
    address: '',
    icon: 'briefcase',
    type: 'work'
  }
  const reorderedLocations = [
    homeLocation,
    workLocation,
    ...savedLocations.filter(loc => loc !== homeLocation && loc !== workLocation)
  ]

  clonedUser.savedLocations = reorderedLocations
  return clonedUser
}

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

      // Last number and last time we requested a code for (to avoid repeat SMS and not waste SMS quota).
      lastPhoneNumberRequested: null,
      lastPhoneRequestTime: null
    }
  }

  _updateUserPrefs = async (userData, silentOnSucceed = false) => {
    // TODO: Change state of Save button while the update action takes place.

    // In userData.savedLocations, filter out entries with blank addresses.
    const newUserData = clone(userData)
    newUserData.savedLocations = newUserData.savedLocations.filter(({ address }) => address && address.length)
    await this.props.createOrUpdateUser(newUserData, silentOnSucceed)

    // TODO: Handle UI feedback (currently an alert() dialog inside createOrUpdateUser).
  }

  /**
   * Silently persists the user data upon accepting terms,
   * and updates the Formik state with the user's id from the database,
   * so that when the user finishes the new account wizard,
   * we update that user record instead of creating another one in the database.
   *
   * Creating the user record before the user finishes the account creation steps
   * is required by the middleware in order to perform phone verification.
   *
   * @param {*} userData The user data state to persist.
   * @param {*} setFieldValue Helper function provided by Formik to update Formik's state.
   */
  _handleCreateNewUser = async (userData, setFieldValue) => {
    // Silently persist the user.
    await this._updateUserPrefs(userData, true)

    // After user is initially persisted and reloaded to the redux state,
    // update the 'id' in the Formik state.
    setFieldValue('id', this.props.loggedInUser.id)
  }

  _handleExit = () => {
    // On exit, route to default search route.
    this.props.routeTo('/')
  }

  /**
   * Requests a phone verification code.
   * This handler is called when the user clicks "Verify my phone" after entering a new number,
   * and also when the user clicks "Request a new code" from the verification modal.
   */
  _handleRequestPhoneVerificationCode = async () => {
    const { lastPhoneNumberRequested, lastPhoneRequestTime, userData } = this.state
    // FIXME: get user data from Formik.
    const { id, phoneNumber } = userData
    const timestamp = new Date()

    // Request a new verification code if we are requesting a different number.
    // or enough time has ellapsed since the last request (1 minute?).
    if (lastPhoneNumberRequested !== phoneNumber ||
        (lastPhoneRequestTime && lastPhoneRequestTime <= timestamp + 60000)) {
      this.setState({
        lastPhoneNumberRequested: phoneNumber,
        lastPhoneRequestTime: timestamp
      })

      await this.props.requestPhoneVerificationSms(id, phoneNumber)
    }
  }

  /**
   * Sends the phone verification code.
   */
  _handleSendPhoneVerificationCode = async code => {
    // Use the original user data to avoid persisting any other pending edits.
    await this.props.verifyPhoneNumber(this.props.loggedInUser, code)
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
    locations: FavoriteLocationsPane,
    finish: AccountSetupFinishPane
  }

  // TODO: Update title bar during componentDidMount.

  render () {
    const { auth, loggedInUser } = this.props

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
        <Formik
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnChange={false}
          validateOnBlur
          validationSchema={validationSchema}
          onSubmit={this._handleSaveAndExit}
          initialValues={cloneWithHomeAndWorkAsTopLocations(loggedInUser)}
        >
          {
            // Formik props provide access to the current user data state and errors,
            // (in props.values, props.touched, props.errors)
            // and to its own blur/change/submit event handlers that automate the state.
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            props => {
              let formContents
              if (this.state.isNewUser) {
                if (!auth.user.email_verified) {
                  // Check and prompt for email verification first to avoid extra user wait.
                  formContents = <VerifyEmailScreen />
                } else {
                  // New users are shown "wizard" (step-by-step) mode
                  // (includes when a "new" user clicks "My Account" from the account menu in the nav bar).
                  formContents = (
                    <NewAccountWizard
                      {...props}
                      onCancel={this._handleExit}
                      // FIXME: capture this.functions below to variables.
                      onCreate={this._handleCreateNewUser}
                      onRequestPhoneVerificationCode={this._handleRequestPhoneVerificationCode}
                      onSendPhoneVerificationCode={this._handleSendPhoneVerificationCode}
                      panes={this._panes}
                    />
                  )
                }
              } else {
                // Existing users are shown all panes together.
                formContents = (
                  <ExistingAccountDisplay
                    {...props}
                    onCancel={this._handleExit}
                    onRequestPhoneVerificationCode={this._handleRequestPhoneVerificationCode}
                    onSendPhoneVerificationCode={this._handleSendPhoneVerificationCode}
                    panes={this._panes}
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
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  requestPhoneVerificationSms: userActions.requestPhoneVerificationSms,
  routeTo: uiActions.routeTo,
  verifyPhoneNumber: userActions.verifyPhoneNumber
}

export default withLoggedInUserSupport(
  withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen)),
  true
)
