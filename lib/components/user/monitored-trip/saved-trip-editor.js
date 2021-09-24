import React from 'react'
import { FormattedMessage } from 'react-intl'

import BackLink from '../back-link'
import StackedPaneDisplay from '../stacked-pane-display'

/**
 * This component handles editing of an existing trip.
 */
const SavedTripEditor = props => {
  // The props include Formik props that provide access to the current trip data (stored in props.values)
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const {
    isCreating,
    onCancel,
    panes,
    values: monitoredTrip
  } = props
  if (monitoredTrip) {
    const paneSequence = [
      {
        pane: panes.basics,
        props,
        title: <FormattedMessage id='components.SavedTripEditor.tripInformation' />
      },
      {
        pane: panes.notifications,
        props,
        title: <FormattedMessage id='components.SavedTripEditor.tripNotifications' />
      }
    ]

    return (
      <>
        <BackLink />
        {isCreating
          ? <StackedPaneDisplay
            onCancel={onCancel}
            paneSequence={paneSequence}
            title={<FormattedMessage
              id={'components.SavedTripEditor.saveNewTrip'}
            />}
          />
          : <StackedPaneDisplay
            onCancel={onCancel}
            paneSequence={paneSequence}
            title={<FormattedMessage
              id={'components.SavedTripEditor.editSavedTrip'}
            />}
          />
        }
      </>
    )
  }

  return (
    <>
      <h1>
        <FormattedMessage id='components.SavedTripEditor.tripNotFound' />
      </h1>
      <p>
        <FormattedMessage id='components.SavedTripEditor.tripNotFoundDescription' />
      </p>
    </>
  )
}

export default SavedTripEditor
