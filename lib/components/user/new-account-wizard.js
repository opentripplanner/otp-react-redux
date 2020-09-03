import React from 'react'

import SequentialPaneDisplay from './sequential-pane-display'

/**
 * This component is the new account wizard.
 */
const NewAccountWizard = ({ onComplete, onCreate, onStartPhoneVerification, panes, userData }) => {
  const {
    hasConsentedToTerms,
    notificationChannel = 'email'
  } = userData

  const paneSequence = {
    terms: {
      disableNext: !hasConsentedToTerms,
      nextId: 'notifications',
      onNext: onCreate,
      pane: panes.terms,
      title: 'Create a new account'
    },
    notifications: {
      nextId: notificationChannel === 'sms' ? 'verifyPhone' : 'places',
      pane: panes.notifications,
      prevId: 'terms',
      title: 'Notification preferences'
    },
    verifyPhone: {
      disableNext: true, // TODO: implement verification.
      nextId: 'places',
      pane: panes.verifyPhone,
      prevId: 'notifications',
      title: 'Verify your phone'
    },
    places: {
      nextId: 'finish',
      pane: panes.locations,
      prevId: 'notifications',
      title: 'Add your locations'
    },
    finish: {
      pane: panes.finish,
      prevId: 'places',
      title: 'Account setup complete!'
    }
  }

  return (
    <SequentialPaneDisplay
      initialPaneId='terms'
      onComplete={onComplete}
      paneSequence={paneSequence}
    />
  )
}

export default NewAccountWizard
