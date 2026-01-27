import { Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { FormikProps } from 'formik'
import React from 'react'

import { AppReduxState } from '../../../util/state-types'
import { getDependentName } from '../../../util/user'
import { MonitoredTrip, User } from '../types'

type Props = FormikProps<MonitoredTrip> & {
  isReadOnly: boolean
  loggedInUser: User
}

/**
 * Displays a banner for read-only state.
 */
const TripReadOnlyPane = ({
  isReadOnly,
  loggedInUser,
  values: trip
}: Props) => {
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

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => ({
  loggedInUser: state.user.loggedInUser
})

export default connect(mapStateToProps)(TripReadOnlyPane)
