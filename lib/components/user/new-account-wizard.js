import React from 'react'

import SequentialPaneDisplay from './sequential-pane-display'

/**
 * This component is the new account wizard.
 */
const NewAccountWizard = props => {
  const { onCancel, panes, values: userData } = props

  const {
    hasConsentedToTerms,
    notificationChannel = 'email'
  } = userData

  const paneSequence = {
    terms: {
      disableNext: !hasConsentedToTerms,
      nextId: 'notifications',
      pane: panes.terms,
      props,
      title: 'Create a new account'
    },
    notifications: {
      nextId: notificationChannel === 'sms' ? 'verifyPhone' : 'places',
      pane: panes.notifications,
      prevId: 'terms',
      props,
      title: 'Notification preferences'
    },
    verifyPhone: {
      disableNext: true, // TODO: implement verification.
      nextId: 'places',
      pane: panes.verifyPhone,
      prevId: 'notifications',
      props,
      title: 'Verify your phone'
    },
    places: {
      nextId: 'finish',
      pane: panes.locations,
      prevId: 'notifications',
      props,
      title: 'Add your locations'
    },
    finish: {
      pane: panes.finish,
      prevId: 'places',
      props,
      title: 'Account setup complete!'
    }
  }

  return (
    <SequentialPaneDisplay
      initialPaneId='terms'
      paneSequence={paneSequence}
    />
  )
}

export default NewAccountWizard
