import React, { Component } from 'react'

import SequentialPaneDisplay from './sequential-pane-display'

/**
 * This component is the new account wizard.
 */
class NewAccountWizard extends Component {
  _handleCreateNewUser = async () => {
    const {
      onCreate, // provided by UserAccountScreen
      setFieldValue, // provided by Formik
      values: userData // provided by Formik
    } = this.props

    const newId = await onCreate(userData)

    // After user is initially persisted and reloaded to the redux state,
    // update the 'id' in the Formik state.
    setFieldValue('id', newId)
  }

  render () {
    // The props include Formik props that provide access to the current user data (stored in props.values)
    // and to its own blur/change/submit event handlers that automate the state.
    // We forward the props to each pane so that their individual controls
    // can be wired to be managed by Formik.
    const props = this.props
    const { panes, values: userData } = props
    const {
      hasConsentedToTerms,
      notificationChannel = 'email'
    } = userData

    const paneSequence = {
      terms: {
        disableNext: !hasConsentedToTerms,
        nextId: 'notifications',
        onNext: this._handleCreateNewUser,
        pane: panes.terms,
        props,
        title: 'Create a new account'
      },
      notifications: {
        disableNext: notificationChannel === 'sms' && !userData.phoneNumber,
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
}

export default NewAccountWizard
