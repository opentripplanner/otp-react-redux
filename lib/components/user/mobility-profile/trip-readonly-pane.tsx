import { Alert } from '@opentripplanner/building-blocks'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { FormikProps } from 'formik'
import React from 'react'

import { AppReduxState } from '../../../util/state-types'
import { getDependentName } from '../../../util/user'
import { MonitoredTrip, User } from '../types'
import { SUCCESS_COLOR_VARIABLES } from '../../util/colors'

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
    <Alert
      alertHeader={
        <FormattedMessage
          id="components.SavedTripEditor.readOnlyBanner"
          values={{ creator }}
        />
      }
      backgroundColor={SUCCESS_COLOR_VARIABLES.warning}
    />
  )
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => ({
  loggedInUser: state.user.loggedInUser
})

export default connect(mapStateToProps)(TripReadOnlyPane)
