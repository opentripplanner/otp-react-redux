import {
  Auth0ContextInterface,
  withAuthenticationRequired
} from '@auth0/auth0-react'
import { connect } from 'react-redux'
import { Form, Formik, FormikProps } from 'formik'
import { injectIntl, IntlShape } from 'react-intl'
import { RouteComponentProps } from 'react-router'
import clone from 'clone'
import React, { ChangeEvent, Component, FormEvent } from 'react'
import styled, { css } from 'styled-components'
import toast from 'react-hot-toast'

import * as userActions from '../../actions/user'
import { AppReduxState } from '../../util/state-types'
import { CREATE_ACCOUNT_PATH, MOBILITY_PATH } from '../../util/constants'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import { toastSuccess } from '../util/toasts'
import PageTitle from '../util/page-title'

import { EditedUser, User } from './types'
import AccountPage from './account-page'
import ExistingAccountDisplay from './existing-account-display'
import MobilityWizard from './mobility-profile/mobility-wizard'
import NewAccountWizard from './new-account-wizard'
import VerifyEmailPane from './verify-email-pane'
import withLoggedInUserSupport from './with-logged-in-user-support'

interface Props {
  auth0: Auth0ContextInterface
  basePath: string
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
  verifyPhoneNumber: (code: string, intl: IntlShape) => void
}

const pendingCss = css`
  border-radius: 2px;
  cursor: wait;
  outline: 1px solid blue;
  /* This next line enhances the visuals in Chromium (webkit) browsers */
  outline: 1px solid -webkit-focus-ring-color;
`

const Wrapper = styled.div`
  @keyframes dive-in {
    0% {
      ${pendingCss}
      outline-offset: 2px;
    }
    100% {
      ${pendingCss}
      outline-offset: -8px;
    }
  }
`
/**
 * This screen handles creating/updating OTP user account settings.
 */
class UserAccountScreen extends Component<Props> {
  _updateUserPrefs = async (userData: EditedUser, silentOnSucceed = false) => {
    const { createOrUpdateUser, intl } = this.props

    // Convert the notification attributes from array to comma-separated string.
    const passedUserData = {
      ...clone(userData),
      notificationChannel: userData.notificationChannel.join(',')
    }

    const result = await createOrUpdateUser(passedUserData, intl)

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

  _handleRequestPhoneVerificationCode = (newPhoneNumber: string) => {
    const { intl, requestPhoneVerificationSms } = this.props
    requestPhoneVerificationSms(newPhoneNumber, intl)
  }

  _submitForm = async (
    t: HTMLInputElement,
    submitForm: () => Promise<void>
  ) => {
    const { intl, isCreating } = this.props
    const firstLabel = t.labels?.[0]

    // Disable input (adds a visual effect) during submission
    t.disabled = true
    const initialStyle = t.style.animation
    t.style.animation = 'dive-in 1s linear infinite'
    const initialCursor = firstLabel ? firstLabel.style.cursor : ''
    if (firstLabel) firstLabel.style.cursor = 'wait'
    const loadingToast = !isCreating
      ? toast.loading(
          intl.formatMessage({ id: 'components.UserAccountScreen.updating' })
        )
      : undefined
    try {
      await submitForm()
      // On success, display a toast notification for existing accounts.
      if (!isCreating) {
        toastSuccess(
          intl.formatMessage({
            // Use a summary text for the field, if defined (e.g. to replace long labels),
            // otherwise, fall back on the first label of the input.
            defaultMessage: firstLabel?.innerText,
            id: `components.UserAccountScreen.fields.${t.name}`
          }),
          intl.formatMessage({
            id: 'components.UserAccountScreen.fieldUpdated'
          }),
          loadingToast
        )
      }
    } catch {
      // Remove any toasts before showing alert.
      toast.remove()
      alert(
        intl.formatMessage({
          id: 'components.UserAccountScreen.errorUpdatingProfile'
        })
      )
    } finally {
      // Re-enable input (remove visuals) and refocus after submission.
      if (firstLabel) firstLabel.style.cursor = initialCursor
      t.disabled = false
      t.style.animation = initialStyle
      t.focus()
    }
  }

  _handleInputChange =
    (formikProps: FormikProps<EditedUser>) => (e: ChangeEvent) => {
      const { handleChange, submitForm, values: userData } = formikProps
      handleChange(e)
      const t = e.target as HTMLInputElement
      const shouldNotSubmit =
        t.name === 'hasConsentedToTerms' ||
        (t.name === 'storeTripHistory' && !userData.id)
      if (!shouldNotSubmit) {
        // Submit the form right away after applying changes to update the user profile.
        // Separate the submission part because this handler must not be async for type check.
        this._submitForm(t, submitForm)
      }
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
    const { auth0, basePath, intl, isCreating, itemId, loggedInUser } =
      this.props
    const loggedInUserWithNotificationArray = {
      ...loggedInUser,
      notificationChannel: loggedInUser.notificationChannel?.split(',') || []
    }
    return (
      <AccountPage subnav={!isCreating}>
        <Wrapper>
          <Formik
            // Force Formik to reload initialValues when we update them (e.g. user gets assigned an id).
            enableReinitialize
            initialValues={loggedInUserWithNotificationArray}
            onSubmit={this._handleFieldChange}
          >
            {
              // Formik props provide access to the current user data state and errors,
              // (in props.values, props.touched, props.errors)
              // and to its own blur/change/submit event handlers that automate the state.
              // We pass the Formik props below to the components rendered so that individual controls
              // can be wired to be managed by Formik.
              (formikProps) => {
                if (itemId === 'verify') {
                  const verifyEmail = intl.formatMessage({
                    id: 'components.NewAccountWizard.verify'
                  })
                  return (
                    <Form id="user-settings-form" noValidate>
                      <PageTitle title={verifyEmail} />
                      <h1>{verifyEmail}</h1>
                      <VerifyEmailPane
                        emailVerified={auth0.user?.email_verified}
                      />
                    </Form>
                  )
                }

                const newFormikProps = {
                  ...formikProps,
                  // Use our own handleChange handler that wraps around Formik's.
                  handleChange: this._handleInputChange(formikProps)
                }

                if (basePath === CREATE_ACCOUNT_PATH) {
                  return (
                    <NewAccountWizard
                      {...newFormikProps}
                      activePaneId={itemId}
                      onCreate={this._handleCreateNewUser}
                    />
                  )
                }

                if (basePath === MOBILITY_PATH) {
                  return (
                    <MobilityWizard {...newFormikProps} activePaneId={itemId} />
                  )
                }

                return (
                  <ExistingAccountDisplay
                    {...newFormikProps}
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
            }
          </Formik>
        </Wrapper>
      </AccountPage>
    )
  }
}

// connect to the redux store

const mapStateToProps = (
  state: AppReduxState,
  ownProps: RouteComponentProps<{ step: string }>
) => {
  const { params, url } = ownProps.match
  const isCreating =
    url.startsWith(CREATE_ACCOUNT_PATH) || url.startsWith(MOBILITY_PATH)
  const basePath = [CREATE_ACCOUNT_PATH, MOBILITY_PATH].find((path) =>
    url.startsWith(path)
  )

  const { step } = params
  return {
    basePath,
    isCreating,
    itemId: step,
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  deleteUser: userActions.deleteUser,
  requestPhoneVerificationSms: userActions.requestPhoneVerificationSms,
  verifyPhoneNumber: userActions.verifyPhoneNumber
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserAccountScreen)),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
