import { FormattedMessage, useIntl } from 'react-intl'
import { FormikProps } from 'formik'
import React, { useCallback } from 'react'

import PageTitle from '../util/page-title'

import { User } from './types'
import AccountSetupFinishPane from './account-setup-finish-pane'
import FavoritePlaceList from './places/favorite-place-list'
import NotificationPrefsPane from './notification-prefs-pane'
import SequentialPaneDisplay from './sequential-pane-display'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailPane from './verify-email-pane'

// The props include Formik props that provide access to the current user data (stored in props.values)
// and to its own blur/change/submit event handlers that automate the state.
// We forward the props to each pane (via SequentialPaneDisplay) so that their individual controls
// can be wired to be managed by Formik.
type FormikUserProps = FormikProps<User>

interface Props extends FormikUserProps {
  activePaneId: string
  onCreate: (value: User) => void
}

/**
 * This component is the new account wizard.
 */
const NewAccountWizard = ({
  activePaneId,
  onCreate, // provided by UserAccountScreen
  ...formikProps // provided by Formik
}: Props): JSX.Element => {
  const { values: userData } = formikProps
  const intl = useIntl()

  const handleCreateNewUser = useCallback(() => {
    // Create a user record only if an id is not assigned.
    if (!userData.id) {
      onCreate(userData)
    }
  }, [onCreate, userData])

  if (activePaneId === 'verify') {
    const verifyEmail = intl.formatMessage({
      id: 'components.NewAccountWizard.verify'
    })
    return (
      <>
        <PageTitle title={verifyEmail} />
        <h1>{verifyEmail}</h1>
        <VerifyEmailPane {...formikProps} />
      </>
    )
  }

  const { hasConsentedToTerms, notificationChannel = 'email' } = userData
  const createNewAccount = intl.formatMessage({
    id: 'components.NewAccountWizard.createNewAccount'
  })
  const paneSequence = [
    {
      id: 'terms',
      invalid: !hasConsentedToTerms,
      invalidMessage: intl.formatMessage({
        id: 'components.TermsOfUsePane.mustAgreeToTerms'
      }),
      onNext: handleCreateNewUser,
      pane: TermsOfUsePane,
      title: createNewAccount
    },
    {
      id: 'notifications',
      invalid:
        notificationChannel === 'sms' &&
        (!userData.phoneNumber || !userData.isPhoneNumberVerified),
      invalidMessage: intl.formatMessage({
        id: 'components.PhoneNumberEditor.invalidPhone'
      }),
      pane: NotificationPrefsPane,
      title: <FormattedMessage id="components.NewAccountWizard.notifications" />
    },
    {
      id: 'places',
      pane: FavoritePlaceList,
      title: <FormattedMessage id="components.NewAccountWizard.places" />
    },
    {
      id: 'finish',
      pane: AccountSetupFinishPane,
      title: <FormattedMessage id="components.NewAccountWizard.finish" />
    }
  ]

  return (
    <>
      <PageTitle title={createNewAccount} />
      <SequentialPaneDisplay
        activePaneId={activePaneId}
        paneProps={formikProps}
        panes={paneSequence}
      />
    </>
  )
}

export default NewAccountWizard
