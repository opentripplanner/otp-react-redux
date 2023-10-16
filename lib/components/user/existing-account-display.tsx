import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { FormikProps } from 'formik'
import React, { useCallback } from 'react'

import { AppReduxState } from '../../util/state-types'
import { toastSuccess } from '../util/toasts'
import { TransitModeConfig } from '../../util/config-types'
import PageTitle from '../util/page-title'

import { User } from './types'
import A11yPrefs from './a11y-prefs'
import BackToTripPlanner from './back-to-trip-planner'
import DeleteUser from './delete-user'
import FavoritePlaceList from './places/favorite-place-list'
import NotificationPrefsPane from './notification-prefs-pane'
import StackedPanes from './stacked-panes'
import TermsOfUsePane from './terms-of-use-pane'

interface Props extends FormikProps<User> {
  wheelchairEnabled: boolean
}

/**
 * This component handles the existing account display.
 */
const ExistingAccountDisplay = (parentProps: Props) => {
  // The props include Formik props that provide access to the current user data
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const { handleChange, submitForm, wheelchairEnabled } = parentProps
  const intl = useIntl()
  const props = {
    ...parentProps,
    handleChange: useCallback(
      async (e) => {
        // Apply changes and submit the form right away to update the user profile.
        handleChange(e)
        try {
          // Disable input during submission
          e.target.disabled = true
          await submitForm()
          // Re-enable input during submission
          e.target.disabled = false
          // Display a toast notification on success.
          toastSuccess(
            intl.formatMessage({
              // Use a summary text for the field, if defined (e.g. to replace long labels),
              // otherwise, fall back on the first label of the input.
              defaultMessage: e.target.labels[0]?.innerText,
              id: `components.ExistingAccountDisplay.fields.${e.target.name}`
            }),
            intl.formatMessage({
              id: 'components.ExistingAccountDisplay.fieldUpdated'
            })
          )
        } catch {
          alert('Error updating profile')
        }
      },
      [intl, handleChange, submitForm]
    )
  }
  const panes = [
    {
      pane: FavoritePlaceList,
      props,
      title: <FormattedMessage id="components.ExistingAccountDisplay.places" />
    },
    {
      pane: NotificationPrefsPane,
      props,
      title: (
        <FormattedMessage id="components.ExistingAccountDisplay.notifications" />
      )
    },
    {
      // Only show option to plan accessible trips by default if accessible trips are possible
      hidden: !wheelchairEnabled,
      pane: A11yPrefs,
      props,
      title: <FormattedMessage id="components.ExistingAccountDisplay.a11y" />
    },
    {
      pane: TermsOfUsePane,
      props: { ...props, disableCheckTerms: true },
      title: <FormattedMessage id="components.ExistingAccountDisplay.terms" />
    },
    {
      pane: DeleteUser,
      props
    }
  ]

  // Repeat text from the SubNav component in the title bar for brevity.
  const settings = intl.formatMessage({
    id: 'components.SubNav.settings'
  })
  const myAccount = intl.formatMessage({
    id: 'components.SubNav.myAccount'
  })
  return (
    <div>
      <BackToTripPlanner />
      <PageTitle title={[settings, myAccount]} />
      <StackedPanes
        panes={panes}
        title={
          <FormattedMessage id="components.ExistingAccountDisplay.mainTitle" />
        }
      />
    </div>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { accessModes } = state.otp.config.modes
  const wheelchairEnabled = accessModes?.some(
    (mode: TransitModeConfig) => mode.showWheelchairSetting
  )
  return {
    wheelchairEnabled
  }
}

export default connect(mapStateToProps)(ExistingAccountDisplay)
