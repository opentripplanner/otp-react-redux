import { FormattedMessage, useIntl } from 'react-intl'
import { useFormikContext } from 'formik'
import React from 'react'

import { BackButtonContent } from '../back-link'
import { MonitoredTrip } from '../types'
import { PaneAttributes } from '../stacked-panes'
import { TRIPS_PATH } from '../../../util/constants'
import DeleteForm from '../delete-form'
import Link from '../../util/link'
import PageTitle from '../../util/page-title'
import StackedPanesWithSave from '../stacked-panes-with-save'
import TripCompanionsPane from '../mobility-profile/trip-companions-pane'
import TripReadonlyPane from '../mobility-profile/trip-readonly-pane'

import TripBasicsPane from './trip-basics-pane'
import TripNotFound from './trip-not-found'
import TripNotificationsPane from './trip-notifications-pane'

interface Props {
  hasMobilityProfile: boolean
  isCreating: boolean
  isReadOnly: boolean
  onCancel: () => void
}

/**
 * This component handles editing of an existing trip.
 */
const SavedTripEditor = (props: Props): JSX.Element => {
  // The props include Formik props that provide access to the current trip data (stored in props.values)
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const { hasMobilityProfile, isCreating, isReadOnly, onCancel } = props
  const { isSubmitting, values: trip } = useFormikContext<MonitoredTrip>()
  const intl = useIntl()

  if (trip) {
    const paneSequence: PaneAttributes[] = [
      {
        pane: TripReadonlyPane,
        props
      },
      {
        pane: TripBasicsPane,
        props,
        title: (
          <FormattedMessage id="components.SavedTripEditor.tripInformation" />
        )
      },
      {
        pane: TripNotificationsPane,
        props,
        title: (
          <FormattedMessage id="components.SavedTripEditor.tripNotifications" />
        )
      }
    ]

    // if mobility profile is present, then add travel companions pane
    if (hasMobilityProfile) {
      paneSequence.push({
        pane: TripCompanionsPane,
        props,
        title: (
          <FormattedMessage id="components.SavedTripEditor.travelCompanions" />
        )
      })
    }

    const title = isReadOnly
      ? intl.formatMessage({ id: 'otpUi.TripDetails.title' })
      : isCreating
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
            trip.id ? { content: <DeleteForm tripId={trip.id} /> } : undefined
          }
          isReadOnly={isReadOnly}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          panes={paneSequence}
          subtitle={
            !isReadOnly ? (
              <FormattedMessage id="components.TripBasicsPane.indicatesRequiredFields" />
            ) : undefined
          }
          title={title}
        />
      </>
    )
  }

  return <TripNotFound />
}

export default SavedTripEditor
