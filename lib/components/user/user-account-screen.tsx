import {
  Auth0ContextInterface,
  withAuthenticationRequired
} from '@auth0/auth0-react'
import { connect } from 'react-redux'
import { Formik } from 'formik'
import { injectIntl, IntlShape } from 'react-intl'
import { RouteComponentProps } from 'react-router'
import clone from 'clone'
import React, { Component, FormEvent } from 'react'
import toast from 'react-hot-toast'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { CREATE_ACCOUNT_PATH } from '../../util/constants'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'

import { User } from './types'
import AccountPage from './account-page'
import ExistingAccountDisplay from './existing-account-display'
import NewAccountWizard from './new-account-wizard'
import withLoggedInUserSupport from './with-logged-in-user-support'

interface Props {
  auth0: Auth0ContextInterface
  createOrUpdateUser: (user: User, intl: IntlShape) => Promise<number>
  deleteUser: (
    user: User,
    auth0: Auth0ContextInterface,
    intl: IntlShape
  ) => void
  intl: IntlShape
  isCreating: boolean
  itemId: string
  loggedInUser: User
  requestPhoneVerificationSms: (phoneNum: string, intl: IntlShape) => void
  routeTo: (to: string) => void
  verifyPhoneNumber: (code: string, intl: IntlShape) => void
}

type EditedUser = Omit<User, 'notificationChannel'> & {
  notificationChannel?: string | string[]
}

/**
 * This screen handles creating/updating OTP user account settings.
 */
class UserAccountScreen extends Component<Props> {
  _updateUserPrefs = async (userData: EditedUser, silentOnSucceed = false) => {
    const { createOrUpdateUser, intl } = this.props

    // Convert the notification attributes from array to comma-separated string.
    const passedUserData = clone(userData)
    const { notificationChannel } = userData
    if (
      notificationChannel &&
      typeof notificationChannel === 'object' &&
      typeof notificationChannel.length === 'number'
    ) {
      passedUserData.notificationChannel = notificationChannel.join(',')
    }
    const result = await createOrUpdateUser(passedUserData as User, intl)

    // If needed, display a toast notification on success.
    if (result === userActions.UserActionResult.SUCCESS && !silentOnSucceed) {
      toast.success(intl.formatMessage({ id: 'actions.user.preferencesSaved' }))
    }

    return result
  }

  /**
   * Silently persists the user data upon accepting terms.
   * Creating the user record before the user finishes the account creation steps
   * is required by the middleware in order to perform phone verification.
   *
   * @param {*} userData The user data state to persist.
   * @returns The new user id the the caller can use.
   */
  _handleCreateNewUser = (userData: EditedUser) => {
    this._updateUserPrefs(userData, true)
  }

  _handleDeleteUser = (evt: FormEvent) => {
    const { auth0, deleteUser, intl, loggedInUser } = this.props
    // Avoid triggering onsubmit with formik (which would result in a save user
    // call).
    evt.preventDefault()
    if (
      window.confirm(
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

  _handleRequestPhoneVerificationCode = (newPhoneNumber: string) => {
    const { intl, requestPhoneVerificationSms } = this.props
    requestPhoneVerificationSms(newPhoneNumber, intl)
  }

  /**
   * Save changes and return to the planner.
   * @param {*} userData The user edited state to be saved, provided by Formik.
   */
  _handleSaveAndExit = async (userData: EditedUser) => {
    await this._updateUserPrefs(userData)
    this._handleExit()
  }

  /**
   * Persist changes immediately (for existing account display)
   * @param {*} userData The user edited state to be saved, provided by Formik.
   */
  _handleFieldChange = async (userData: EditedUser) => {
    // Turn off the default toast, so we can display a toast per field.
    const result = await this._updateUserPrefs(userData, true)
    if (result !== userActions.UserActionResult.SUCCESS) {
      throw new Error('User update failed.')
    }
  }

  _handleSendPhoneVerificationCode = async ({
    validationCode: code
  }: {
    validationCode: string
  }) => {
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
      notificationChannel: loggedInUser.notificationChannel?.split(','),
      pushDevices: 2
    }
    return (
      <AccountPage subnav={!isCreating}>
        <Formik
          // Force Formik to reload initialValues when we update them (e.g. user gets assigned an id).
          enableReinitialize
          initialValues={loggedInUserWithNotificationArray}
          onSubmit={
            isCreating ? this._handleSaveAndExit : this._handleFieldChange
          }
        >
          {
            // Formik props provide access to the current user data state and errors,
            // (in props.values, props.touched, props.errors)
            // and to its own blur/change/submit event handlers that automate the state.
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            (formikProps) => (
              <DisplayComponent
                {...formikProps}
                activePaneId={itemId}
                // @ts-expect-error emailVerified prop used by only one of the DisplayComponent.
                emailVerified={auth0.user?.email_verified}
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
            )
          }
        </Formik>
      </AccountPage>
    )
  }
}

// connect to the redux store

const mapStateToProps = (
  state: any,
  ownProps: RouteComponentProps<{ step: string }>
) => {
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
