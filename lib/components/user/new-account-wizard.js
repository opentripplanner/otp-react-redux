/* eslint-disable react/prop-types */
import { FormattedMessage } from 'react-intl'
import React, { Component } from 'react'

import AccountSetupFinishPane from './account-setup-finish-pane'
import FavoritePlaceList from './places/favorite-place-list'
import NotificationPrefsPane from './notification-prefs-pane'
import SequentialPaneDisplay from './sequential-pane-display'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailPane from './verify-email-pane'

/**
 * This component is the new account wizard.
 */
class NewAccountWizard extends Component {
  _handleCreateNewUser = () => {
    const {
      onCreate, // provided by UserAccountScreen
      values: userData // provided by Formik
    } = this.props

    // Create a user record only if an id is not assigned.
    if (!userData.id) {
      onCreate(userData)
    }
  }

  render() {
    // The props include Formik props that provide access to the current user data (stored in props.values)
    // and to its own blur/change/submit event handlers that automate the state.
    // We forward the props to each pane so that their individual controls
    // can be wired to be managed by Formik.
    const { activePaneId, values: userData } = this.props

    if (activePaneId === 'verify') {
      return (
        <>
          <h1>
            <FormattedMessage id="components.NewAccountWizard.verify" />
          </h1>
          <VerifyEmailPane {...this.props} />
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

    // Pass props and title to each entry above
    paneSequence.forEach((pane) => {
      pane.props = this.props
    })

    return (
      <SequentialPaneDisplay activePaneId={activePaneId} panes={paneSequence} />
    )
  }
}

export default NewAccountWizard
