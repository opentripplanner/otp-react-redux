import { FormattedMessage, useIntl } from 'react-intl'
import React, { ComponentType } from 'react'

import { BackButtonContent } from '../back-link'
import { MonitoredTrip } from '../types'
import { TRIPS_PATH } from '../../../util/constants'
import DeleteForm from '../delete-form'
import Link from '../../util/link'
import PageTitle from '../../util/page-title'
import StackedPanesWithSave from '../stacked-panes-with-save'

import TripNotFound from './trip-not-found'

interface Props {
  hasMobilityProfile: boolean
  isCreating: boolean
  onCancel: () => void
  panes: Record<string, ComponentType>
  values: MonitoredTrip
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

    // if mobility profile is present, then add travel companions pane
    if (props.hasMobilityProfile) {
      paneSequence.push({
        pane: panes.travelCompanion,
        props,
        title: (
          <FormattedMessage id="components.SavedTripEditor.travelCompanion" />
        )
      })
    }

    const title = isCreating
      ? intl.formatMessage({ id: 'components.SavedTripEditor.saveNewTrip' })
      : intl.formatMessage({ id: 'components.SavedTripEditor.editSavedTrip' })

    return (
      <>
        <PageTitle title={title} />
        {/* If creating, back button should return to trip planner. If not, it should return
        to saved trips, just in case the user accessed this page through their email. */}
        <Link to={isCreating ? '/' : TRIPS_PATH}>
          <BackButtonContent />
        </Link>
        <StackedPanesWithSave
          extraButton={
            monitoredTrip.id
              ? { content: <DeleteForm tripId={monitoredTrip.id} /> }
              : undefined
          }
          onCancel={onCancel}
          panes={paneSequence}
          title={title}
        />
      </>
    )
  }

  return <TripNotFound />
}

export default SavedTripEditor
