import { FormattedMessage } from 'react-intl'
import { FormikProps } from 'formik'
import React, { Component } from 'react'

import { User } from './types'
import AccountSetupFinishPane from './account-setup-finish-pane'
import FavoritePlaceList from './places/favorite-place-list'
import NotificationPrefsPane from './notification-prefs-pane'
import SequentialPaneDisplay from './sequential-pane-display'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailPane from './verify-email-pane'

type FormikUserProps = FormikProps<User>

interface Props extends FormikUserProps {
  activePaneId: string
  onCreate: (value: User) => void
}

/**
 * This component is the new account wizard.
 */
class NewAccountWizard extends Component<Props> {
  _handleCreateNewUser = (): void => {
    const {
      onCreate, // provided by UserAccountScreen
      values: userData // provided by Formik
    } = this.props

    // Create a user record only if an id is not assigned.
    if (!userData.id) {
      onCreate(userData)
    }
  }

  render(): JSX.Element {
    // The props include Formik props that provide access to the current user data (stored in props.values)
    // and to its own blur/change/submit event handlers that automate the state.
    // We forward the props to each pane (via SequentialPaneDisplay) so that their individual controls
    // can be wired to be managed by Formik.
    const { activePaneId, onCreate, ...formikProps } = this.props
    const { values: userData } = formikProps
    if (activePaneId === 'verify') {
      return (
        <>
          <h1>
            <FormattedMessage id="components.NewAccountWizard.verify" />
          </h1>
          <VerifyEmailPane {...formikProps} />
        </>
      )
    }

    const { hasConsentedToTerms, notificationChannel = 'email' } = userData

    const paneSequence = [
      {
        disableNext: !hasConsentedToTerms,
        id: 'terms',
        onNext: this._handleCreateNewUser,
        pane: TermsOfUsePane,
        title: <FormattedMessage id="components.NewAccountWizard.terms" />
      },
      {
        disableNext: notificationChannel === 'sms' && !userData.phoneNumber,
        id: 'notifications',
        pane: NotificationPrefsPane,
        title: (
          <FormattedMessage id="components.NewAccountWizard.notifications" />
        )
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
      <SequentialPaneDisplay
        activePaneId={activePaneId}
        paneProps={formikProps}
        panes={paneSequence}
      />
    )
  }
}

export default NewAccountWizard
