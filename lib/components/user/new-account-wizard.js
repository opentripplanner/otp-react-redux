import React from 'react'

import SequentialPaneDisplay from './sequential-pane-display'

/**
 * This component is the new account wizard.
 */
const NewAccountWizard = props => {
  // The props include Formik props that provide access to the current user data (stored in props.values)
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const { onCreate, panes, values: userData } = props

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
      props,
      title: 'Create a new account'
    },
    notifications: {
      disableNext: notificationChannel === 'sms' && !userData.isPhoneNumberVerified,
      nextId: 'places',
      pane: panes.notifications,
      prevId: 'terms',
      props,
      title: 'Notification preferences'
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
