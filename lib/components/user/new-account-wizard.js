import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import AccountSetupFinishPane from './account-setup-finish-pane'
import NotificationPrefsPane from './notification-prefs-pane'
import FavoritePlaceList from './places/favorite-place-list'
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

  render () {
    // The props include Formik props that provide access to the current user data (stored in props.values)
    // and to its own blur/change/submit event handlers that automate the state.
    // We forward the props to each pane so that their individual controls
    // can be wired to be managed by Formik.
    const { activePaneId, values: userData } = this.props
    const {
      hasConsentedToTerms,
      notificationChannel = 'email'
    } = userData

    const paneSequence = {
      // Verify will redirect according to email verification state
      // and thus doesn't carry a nextId.
      verify: {
        hideNavigation: true,
        pane: VerifyEmailPane,
        title: <FormattedMessage id='components.NewAccountWizard.verify' />
      },
      // eslint-disable-next-line sort-keys
      terms: {
        disableNext: !hasConsentedToTerms,
        nextId: 'notifications',
        onNext: this._handleCreateNewUser,
        pane: TermsOfUsePane,
        title: <FormattedMessage id='components.NewAccountWizard.terms' />
      },
      // eslint-disable-next-line sort-keys
      notifications: {
        disableNext: notificationChannel === 'sms' && !userData.phoneNumber,
        nextId: 'places',
        pane: NotificationPrefsPane,
        prevId: 'terms',
        title: <FormattedMessage id='components.NewAccountWizard.notifications' />
      },
      places: {
        nextId: 'finish',
        pane: FavoritePlacesList,
        prevId: 'notifications',
        title: <FormattedMessage id='components.NewAccountWizard.places' />
      },
      // eslint-disable-next-line sort-keys
      finish: {
        pane: AccountSetupFinishPane,
        prevId: 'places',
        title: <FormattedMessage id='components.NewAccountWizard.finish' />
      }
    }

    // Pass props and title to each entry above
    Object.keys(paneSequence).forEach(k => {
      const pane = paneSequence[k]
      pane.props = this.props
    })

    return (
      <SequentialPaneDisplay
        activePaneId={activePaneId}
        paneSequence={paneSequence}
      />
    )
  }
}

export default NewAccountWizard
