import React, { Component } from 'react'

import { CREATE_ACCOUNT_PATH } from '../../util/constants'
import SequentialPaneDisplay from './sequential-pane-display'

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

  componentDidMount () {
    // Route to the correct pane passed as initialPane
    const { initialPaneId, panes, routeTo, values: userData } = this.props
    const { hasConsentedToTerms } = userData

    // If the desired pane id doesn't exist, or the user hasa not consented to terms,
    // fall back to the 'terms' pane.
    const paneIdToShow = (hasConsentedToTerms && panes[initialPaneId]) ? initialPaneId : 'terms'

    routeTo(`${CREATE_ACCOUNT_PATH}/${paneIdToShow}`)
  }

  render () {
    // The props include Formik props that provide access to the current user data (stored in props.values)
    // and to its own blur/change/submit event handlers that automate the state.
    // We forward the props to each pane so that their individual controls
    // can be wired to be managed by Formik.
    const props = this.props
    const { initialPaneId, panes, routeTo, values: userData } = props
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
        pane: panes.places,
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

    // If the desired pane id doesn't exist, or the user hasa not consented to terms,
    // fall back to the 'terms' pane.
    const paneIdToShow = (hasConsentedToTerms && panes[initialPaneId]) ? initialPaneId : 'terms'

    return (
      <SequentialPaneDisplay
        initialPaneId={paneIdToShow}
        paneSequence={paneSequence}
        routeTo={routeTo}
      />
    )
  }
}

export default NewAccountWizard
