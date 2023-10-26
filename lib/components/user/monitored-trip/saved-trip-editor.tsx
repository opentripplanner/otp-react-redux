import { FormattedMessage, useIntl } from 'react-intl'
import React, { ComponentType } from 'react'

import BackLink from '../back-link'
import PageTitle from '../../util/page-title'
import StackedPanesWithSave from '../stacked-panes-with-save'

interface Props {
  isCreating: boolean
  onCancel: () => void
  panes: Record<string, ComponentType>
  // TODO: Combine monitored trip types
  values: Record<string, unknown>
}

/**
 * This component handles editing of an existing trip.
 */
const SavedTripEditor = (props: Props): JSX.Element => {
  // The props include Formik props that provide access to the current trip data (stored in props.values)
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const { isCreating, onCancel, panes, values: monitoredTrip } = props
  const intl = useIntl()

  if (monitoredTrip) {
    const paneSequence = [
      {
        pane: panes.basics,
        props,
        title: (
          <FormattedMessage id="components.SavedTripEditor.tripInformation" />
        )
      },
      {
        pane: panes.notifications,
        props,
        title: (
          <FormattedMessage id="components.SavedTripEditor.tripNotifications" />
        )
      }
    ]

    const title = isCreating
      ? intl.formatMessage({ id: 'components.SavedTripEditor.saveNewTrip' })
      : intl.formatMessage({ id: 'components.SavedTripEditor.editSavedTrip' })

    return (
      <>
        <PageTitle title={title} />
        <BackLink />
        <StackedPanesWithSave
          onCancel={onCancel}
          panes={paneSequence}
          title={title}
        />
      </>
    )
  }

  const tripNotFound = intl.formatMessage({
    id: 'components.SavedTripEditor.tripNotFound'
  })
  return (
    <>
      <PageTitle title={tripNotFound} />
      <h1>{tripNotFound}</h1>
      <p>
        <FormattedMessage id="components.SavedTripEditor.tripNotFoundDescription" />
      </p>
    </>
  )
}

export default SavedTripEditor
