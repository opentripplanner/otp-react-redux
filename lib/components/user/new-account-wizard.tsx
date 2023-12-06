import { connect } from 'react-redux'
import { Form, FormikProps } from 'formik'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import React, { useCallback } from 'react'
import toast from 'react-hot-toast'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import PageTitle from '../util/page-title'

import { EditedUser } from './types'
import AccountSetupFinishPane from './account-setup-finish-pane'
import AssistiveDevicesPane from './mobity-profile/assistive-devices-pane'
import FavoritePlaceList from './places/favorite-place-list'
import LimitationsPane from './mobity-profile/limitations-pane'
import NotificationPrefsPane from './notification-prefs-pane'
import SequentialPaneDisplay, { PaneProps } from './sequential-pane-display'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailPane from './verify-email-pane'

// The props include Formik props that provide access to the current user data (stored in props.values)
// and to its own blur/change/submit event handlers that automate the state.
// We forward the props to each pane (via SequentialPaneDisplay) so that their individual controls
// can be wired to be managed by Formik.
interface Props extends FormikProps<EditedUser> {
  activePaneId: string
  onCreate: (value: EditedUser) => void
  panes: PaneProps[]
  routeTo: (to: string) => void
}

const standardPanes: Record<string, PaneProps> = {
  finish: {
    id: 'finish',
    pane: AccountSetupFinishPane,
    title: <FormattedMessage id="components.NewAccountWizard.finish" />
  },
  mobility1: {
    id: 'mobility1',
    pane: AssistiveDevicesPane,
    title: <FormattedMessage id="components.MobilityProfile.title" />
  },
  mobility2: {
    id: 'mobility2',
    pane: LimitationsPane,
    title: <FormattedMessage id="components.MobilityProfile.title" />
  },
  notifications: {
    getInvalidMessage: (intl: IntlShape) =>
      intl.formatMessage({
        id: 'components.PhoneNumberEditor.invalidPhone'
      }),
    id: 'notifications',
    isInvalid: ({
      isPhoneNumberVerified,
      notificationChannel,
      phoneNumber
    }: EditedUser) => {
      return (
        notificationChannel?.includes('sms') &&
        (!phoneNumber || !isPhoneNumberVerified)
      )
    },
    pane: NotificationPrefsPane,
    title: <FormattedMessage id="components.NewAccountWizard.notifications" />
  },
  places: {
    id: 'places',
    pane: FavoritePlaceList,
    title: <FormattedMessage id="components.NewAccountWizard.places" />
  },
  terms: {
    getInvalidMessage: (intl: IntlShape) =>
      intl.formatMessage({
        id: 'components.TermsOfUsePane.mustAgreeToTerms'
      }),
    id: 'terms',
    isInvalid: ({ hasConsentedToTerms }: EditedUser) => !hasConsentedToTerms,
    pane: TermsOfUsePane,
    title: (
      <FormattedMessage id="components.NewAccountWizard.createNewAccount" />
    )
  }
}

function getPanes(pageIds: string[]) {
  return pageIds.map((pageId) => standardPanes[pageId])
}

/**
 * This component is the new account wizard.
 */
const NewAccountWizard = ({
  activePaneId,
  onCreate, // provided by UserAccountScreen
  panes,
  ...formikProps // provided by Formik
}: Props): JSX.Element => {
  const { values: userData } = formikProps
  const intl = useIntl()

  const handleNext = useCallback(() => {
    if (activePaneId === 'terms') {
      // Create a user record only if an id is not assigned.
      if (!userData.id) {
        onCreate(userData)
      }
    }
  }, [activePaneId, onCreate, userData])

  const handleFinish = useCallback(() => {
    // Display a toast to acknowledge saved changes
    // (although in reality, changes quietly took effect in previous screens).
    toast.success(intl.formatMessage({ id: 'actions.user.preferencesSaved' }))

    routeTo('/')
  }, [intl])

  if (activePaneId === 'verify') {
    const verifyEmail = intl.formatMessage({
      id: 'components.NewAccountWizard.verify'
    })
    return (
      <Form id="user-settings-form" noValidate>
        <PageTitle title={verifyEmail} />
        <h1>{verifyEmail}</h1>
        <VerifyEmailPane {...formikProps} />
      </Form>
    )
  }

  const createNewAccount = intl.formatMessage({
    id: 'components.NewAccountWizard.createNewAccount'
  })

  return (
    <Form id="user-settings-form" noValidate>
      <PageTitle title={createNewAccount} />
      <SequentialPaneDisplay
        activePaneId={activePaneId}
        onFinish={handleFinish}
        onNext={handleNext}
        paneProps={formikProps}
        panes={panes}
      />
    </Form>
  )
}

// Get the new account pages configuration, if any, from redux state.
const mapStateToProps = (state: AppReduxState, ownProps: Props) => {
  return {
    panes: getPanes(
      state.otp.config.newAccountPages || [
        'terms',
        'notifications',
        'places',
        'finish'
      ]
    )
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(NewAccountWizard)
