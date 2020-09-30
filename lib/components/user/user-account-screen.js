import clone from 'clone'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'
import * as yup from 'yup'

import { routeTo } from '../../actions/ui'
import { createOrUpdateUser } from '../../actions/user'
import { isNewUser } from '../../util/user'
import DesktopNav from '../app/desktop-nav'
import AccountSetupFinishPane from './account-setup-finish-pane'
import ExistingAccountDisplay from './existing-account-display'
import FavoriteLocationsPane, { isHome, isWork } from './favorite-locations-pane'
import NewAccountWizard from './new-account-wizard'
import NotificationPrefsPane from './notification-prefs-pane'
import PhoneVerificationPane from './phone-verification-pane'
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
  _updateUserPrefs = async userData => {
    // TODO: Change state of Save button while the update action takes place.

    // In userData.savedLocations, filter out entries with blank addresses.
    const newUserData = clone(userData)
    newUserData.savedLocations = newUserData.savedLocations.filter(({ address }) => address && address.length)
    await this.props.createOrUpdateUser(newUserData)

    // TODO: Handle UI feedback (currently an alert() dialog inside createOrUpdateUser).
  }

  _handleExit = () => {
    // On exit, route to default search route.
    this.props.routeTo('/')
  }

  _handleExitAndSave = async userData => {
    await this._updateUserPrefs(userData)
    this._handleExit()
  }

  // Make an index of pane components, so we don't render all panes at once on every render.
  _panes = {
    terms: TermsOfUsePane,
    notifications: NotificationPrefsPane,
    verifyPhone: PhoneVerificationPane,
    locations: FavoriteLocationsPane,
    finish: AccountSetupFinishPane
  }

  // TODO: Update title bar during componentDidMount.

  render () {
    const { auth, loggedInUser } = this.props
    const handleExit = this._handleExit

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
        <Formik
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnChange={false}
          validateOnBlur
          validationSchema={validationSchema}
          onSubmit={this._handleExitAndSave}
          initialValues={cloneWithHomeAndWorkAsTopLocations(loggedInUser)}
        >
          {
            props => {
              let formContents
              if (isNewUser(loggedInUser)) {
                if (!auth.user.email_verified) {
                  // Check and prompt for email verification first to avoid extra user wait.
                  formContents = <VerifyEmailScreen />
                } else {
                  // New users are shown "wizard" (step-by-step) mode
                  // (includes when a "new" user clicks "My Account" from the account menu in the nav bar).
                  formContents = (
                    <NewAccountWizard
                      {...props}
                      onCancel={handleExit}
                      panes={this._panes}
                    />
                  )
                }
              } else {
                // Existing users are shown all panes together.
                formContents = (
                  <ExistingAccountDisplay
                    {...props}
                    onCancel={handleExit}
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
  createOrUpdateUser,
  routeTo
}

export default withLoggedInUserSupport(
  withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen)),
  true
)
