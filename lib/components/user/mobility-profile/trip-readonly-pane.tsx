import { Alert } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useFormikContext } from 'formik'
import React, { ReactNode } from 'react'

import { getDependentName } from '../../../util/user'
import { MonitoredTrip, User } from '../types'

type Props = {
  isReadOnly: boolean
  loggedInUser: User
}

/**
 * Displays a banner for read-only state.
 */
const TripReadOnlyPane = ({ isReadOnly, loggedInUser }: Props): ReactNode => {
  const { values: trip } = useFormikContext<MonitoredTrip>()

  if (!isReadOnly) return null

  const { companion, primary } = trip

  const iAmThePrimaryTraveler =
    (!primary && trip.userId === loggedInUser?.id) ||
    primary?.userId === loggedInUser?.id

  const creator = iAmThePrimaryTraveler
    ? companion?.nickname || companion?.email
    : primary
    ? primary.name || primary.email
    : getDependentName(
        loggedInUser?.dependentsInfo?.find((d) => d.userId === trip.userId)
      )

  return (
    <Alert bsStyle="warning" style={{ margin: '-30px 0' }}>
      <FormattedMessage
        id="components.SavedTripEditor.readOnlyBanner"
        values={{ creator }}
      />
    </Alert>
  )
}

export default TripReadOnlyPane
