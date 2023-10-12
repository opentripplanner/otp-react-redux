// TODO: typescript
/* eslint-disable react/prop-types */
import * as yup from 'yup'
import { connect } from 'react-redux'
import { Form, Formik } from 'formik'
import { injectIntl } from 'react-intl'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import React, { Component } from 'react'
import toast from 'react-hot-toast'

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

    // Convert the notification attributes from array to comma-separated string.
    const passedUserData = clone(userData)
    const { notificationChannel } = passedUserData
    if (
      typeof notificationChannel === 'object' &&
      typeof notificationChannel.length === 'number'
    ) {
      passedUserData.notificationChannel = notificationChannel.join(',')
    }
    const result = await createOrUpdateUser(passedUserData, intl)

    // If needed, display a toast notification on success.
    if (result === userActions.UserActionResult.SUCCESS && !silentOnSucceed) {
      toast.success(intl.formatMessage({ id: 'actions.user.preferencesSaved' }))
    }
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
      // eslint-disable-next-line no-restricted-globals
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

  _handleSendPhoneVerificationCode = async ({ validationCode: code }) => {
    const { intl, verifyPhoneNumber } = this.props
    await verifyPhoneNumber(code, intl)
  }

  render() {
    const { auth0, isCreating, itemId, loggedInUser } = this.props
    const DisplayComponent = isCreating
      ? NewAccountWizard
      : ExistingAccountDisplay
    const loggedInUserWithNotificationArray = {
      ...loggedInUser,
      notificationChannel: loggedInUser.notificationChannel.split(',')
    }
    return (
      <AccountPage subnav={!isCreating}>
        <Formik
          // Force Formik to reload initialValues when we update them (e.g. user gets assigned an id).
          enableReinitialize
          initialValues={loggedInUserWithNotificationArray}
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
            (formikProps) => (
              <Form id="user-settings-form" noValidate>
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
                />
              </Form>
            )
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
    loggedInUser: state.user.loggedInUser
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
