import { connect } from 'react-redux'
import { Formik, FormikProps } from 'formik'
import { injectIntl, IntlShape } from 'react-intl'
import { Route, Switch } from 'react-router'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import React, { ChangeEvent, Component } from 'react'
import styled, { css } from 'styled-components'
import toast from 'react-hot-toast'

import * as userActions from '../../actions/user'
import { AppReduxState } from '../../util/state-types'
import { cleanupMobilityDevices } from '../../util/user'
import {
  CREATE_ACCOUNT_PATH,
  CREATE_ACCOUNT_VERIFY_PATH,
  MOBILITY_PATH
} from '../../util/constants'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import { toastSuccess } from '../util/toasts'

import { EditedUser, User } from './types'
import AccountPage from './account-page'
import ExistingAccountDisplay from './existing-account-display'
import MobilityWizard from './mobility-profile/mobility-wizard'
import NewAccountWizard from './new-account-wizard'
import VerifyEmailScreen from './verify-email-screen'
import withLoggedInUserSupport from './with-logged-in-user-support'

interface Props {
  createOrUpdateUser: (user: User, intl: IntlShape) => Promise<number>
  intl: IntlShape
  isWizard: boolean
  loggedInUser: User
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
    const { createOrUpdateUser, intl, loggedInUser } = this.props

    // Convert the notification attributes from array to comma-separated string.
    const passedUserData = {
      ...clone(userData),
      notificationChannel: userData.notificationChannel.join(',')
    }
    cleanupMobilityDevices(
      passedUserData.mobilityProfile,
      loggedInUser.mobilityProfile?.mobilityDevices
    )

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

  _submitForm = async (
    t: HTMLInputElement,
    submitForm: () => Promise<void>
  ) => {
    const { intl, isWizard } = this.props
    const firstLabel = t.labels?.[0]

    // Disable input (adds a visual effect) during submission
    t.disabled = true
    const initialStyle = t.style.animation
    t.style.animation = 'dive-in 1s linear infinite'
    const initialCursor = firstLabel ? firstLabel.style.cursor : ''
    if (firstLabel) firstLabel.style.cursor = 'wait'
    const loadingToast = !isWizard
      ? toast.loading(
          intl.formatMessage({ id: 'components.UserAccountScreen.updating' })
        )
      : undefined
    try {
      await submitForm()
      // On success, display a toast notification for existing accounts.
      if (!isWizard) {
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

  render() {
    const { isWizard, loggedInUser } = this.props
    const loggedInUserWithNotificationArray = {
      ...loggedInUser,
      notificationChannel: loggedInUser.notificationChannel?.split(',') || []
    }
    return (
      <AccountPage subnav={!isWizard}>
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
                const newFormikProps = {
                  ...formikProps,
                  // Use our own handleChange handler that wraps around Formik's.
                  handleChange: this._handleInputChange(formikProps)
                }
                return (
                  <Switch>
                    <Route exact path={CREATE_ACCOUNT_VERIFY_PATH}>
                      <VerifyEmailScreen />
                    </Route>
                    <Route path={CREATE_ACCOUNT_PATH}>
                      <NewAccountWizard
                        formikProps={newFormikProps}
                        onCreate={this._handleCreateNewUser}
                      />
                    </Route>
                    <Route path={MOBILITY_PATH}>
                      <MobilityWizard formikProps={newFormikProps} />
                    </Route>
                    <Route>
                      <ExistingAccountDisplay {...newFormikProps} />
                    </Route>
                  </Switch>
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

const mapStateToProps = (state: AppReduxState) => {
  const { pathname } = state.router.location
  const basePath = [CREATE_ACCOUNT_PATH, MOBILITY_PATH].find((path) =>
    pathname.startsWith(path)
  )
  return {
    isWizard: !!basePath,
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserAccountScreen)),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
