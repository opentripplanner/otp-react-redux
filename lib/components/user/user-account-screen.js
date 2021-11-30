import * as yup from 'yup'
import { connect } from 'react-redux'
import { Form, Formik } from 'formik'
import { injectIntl } from 'react-intl'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { CREATE_ACCOUNT_PATH } from '../../util/constants'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'

import AccountPage from './account-page'
import ExistingAccountDisplay from './existing-account-display'
import NewAccountWizard from './new-account-wizard'
import withLoggedInUserSupport from './with-logged-in-user-support'

// The validation schema for the form fields.
// FIXME: validationSchema is not really directly used, so the text below is never shown.
//   Also, this may be removed depending on fate of the Save button on this screen.
const validationSchema = yup.object({
  accessibilityRoutingByDefault: yup.boolean(),
  email: yup.string().email(),
  hasConsentedToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the terms to continue.'),
  notificationChannel: yup.string().oneOf(['email', 'sms', 'none']),
  savedLocations: yup.array().of(
    yup.object({
      address: yup.string(),
      icon: yup.string(),
      type: yup.string()
    })
  ),
  storeTripHistory: yup.boolean()
})

/**
 * This screen handles creating/updating OTP user account settings.
 */
class UserAccountScreen extends Component {
  _updateUserPrefs = async (userData, silentOnSucceed = false) => {
    const { createOrUpdateUser, intl } = this.props
    // TODO: Change state of Save button while the update action takes place.

    await createOrUpdateUser(userData, silentOnSucceed, intl)

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
  _handleCreateNewUser = (userData) => {
    this._updateUserPrefs(userData, true)
  }

  _handleDeleteUser = (evt) => {
    const { auth0, deleteUser, intl, loggedInUser } = this.props
    // Avoid triggering onsubmit with formik (which would result in a save user
    // call).
    evt.preventDefault()
    if (
      confirm(
        intl.formatMessage({ id: 'components.UserAccountScreen.confirmDelete' })
      )
    ) {
      deleteUser(loggedInUser, auth0, intl)
    }
  }

  _handleExit = () => {
    // On exit, route to default search route.
    this.props.routeTo('/')
  }

  _handleRequestPhoneVerificationCode = (newPhoneNumber) => {
    const { intl, requestPhoneVerificationSms } = this.props
    requestPhoneVerificationSms(newPhoneNumber, intl)
  }

  /**
   * Save changes and return to the planner.
   * @param {*} userData The user edited state to be saved, provided by Formik.
   */
  _handleSaveAndExit = async (userData) => {
    await this._updateUserPrefs(userData)
    this._handleExit()
  }

  _handleSendPhoneVerificationCode = (code) => {
    const { intl, verifyPhoneNumber } = this.props
    verifyPhoneNumber(code, intl)
  }

  // TODO: Update title bar during componentDidMount.

  render() {
    const { auth0, isCreating, itemId, loggedInUser, phoneFormatOptions } =
      this.props

    return (
      <AccountPage subnav={!isCreating}>
        <Formik
          // Force Formik to reload initialValues when we update them (e.g. user gets assigned an id).
          enableReinitialize
          initialValues={loggedInUser}
          onSubmit={this._handleSaveAndExit}
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnBlur
          validateOnChange={false}
          validationSchema={validationSchema}
        >
          {
            // Formik props provide access to the current user data state and errors,
            // (in props.values, props.touched, props.errors)
            // and to its own blur/change/submit event handlers that automate the state.
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            (formikProps) => {
              const DisplayComponent = isCreating
                ? NewAccountWizard
                : ExistingAccountDisplay

              return (
                <Form noValidate>
                  <DisplayComponent
                    {...formikProps}
                    activePaneId={itemId}
                    emailVerified={auth0.user.email_verified}
                    loggedInUser={loggedInUser}
                    onCancel={this._handleExit}
                    onCreate={this._handleCreateNewUser}
                    onDelete={this._handleDeleteUser}
                    onRequestPhoneVerificationCode={
                      this._handleRequestPhoneVerificationCode
                    }
                    onSendPhoneVerificationCode={
                      this._handleSendPhoneVerificationCode
                    }
                    phoneFormatOptions={phoneFormatOptions}
                  />
                </Form>
              )
            }
          }
        </Formik>
      </AccountPage>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { params, url } = ownProps.match
  const isCreating = url.startsWith(CREATE_ACCOUNT_PATH)
  const { step } = params
  return {
    isCreating,
    itemId: step,
    loggedInUser: state.user.loggedInUser,
    phoneFormatOptions: state.otp.config.phoneFormatOptions
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  deleteUser: userActions.deleteUser,
  requestPhoneVerificationSms: userActions.requestPhoneVerificationSms,
  routeTo: uiActions.routeTo,
  verifyPhoneNumber: userActions.verifyPhoneNumber
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserAccountScreen)),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
