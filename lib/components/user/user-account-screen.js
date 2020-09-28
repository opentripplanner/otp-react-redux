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
import FavoriteLocationsPane from './favorite-locations-pane'
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
 * This screen handles creating/updating OTP user account settings.
 */
class UserAccountScreen extends Component {
  _updateUserPrefs = async userData => {
    // TODO: Change state of Save button while the update action takes place.

    // FIXME: Filter out blank 'home' and 'work' locations?
    // (That used to be done in the favorite locations pane.)
    // If not, they will be saved, however there is no side effect.

    const { createOrUpdateUser } = this.props
    await createOrUpdateUser(userData)

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
          initialValues={loggedInUser}
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
                      //onComplete={props.handleSubmit}
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
                    //onComplete={props.handleSubmit}
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
