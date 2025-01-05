import { connect } from 'react-redux'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import { FormikProps } from 'formik'
import React, { useCallback, useEffect } from 'react'

import * as userActions from '../../../actions/user'
import { AppReduxState } from '../../../util/state-types'
import { getDependentName } from '../../../util/user'
import { MonitoredTrip, User } from '../types'

import CompanionSelector, { Option } from './companion-selector'

type Props = FormikProps<MonitoredTrip> & {
  getDependentUserInfo: (userIds: string[], intl: IntlShape) => void
  isReadOnly: boolean
  loggedInUser: User
}

function optionValue(option: Option | null) {
  if (!option) return null
  return option?.value
}

/**
 * Pane for showing/setting trip companions and observers.
 */
const TripCompanions = ({
  getDependentUserInfo,
  isReadOnly,
  loggedInUser,
  setFieldValue,
  values: trip
}: Props): JSX.Element => {
  const handleCompanionChange = useCallback(
    (option: Option | Option[] | null) => {
      if (!option || 'label' in option) {
        setFieldValue('companion', optionValue(option))
      }
    },
    [setFieldValue]
  )

  const handleObserversChange = useCallback(
    (options: Option | Option[] | null) => {
      if (!options || 'length' in options) {
        setFieldValue('observers', (options || []).map(optionValue))
      }
    },
    [setFieldValue]
  )

  const intl = useIntl()
  const dependents = loggedInUser?.dependents

  useEffect(() => {
    if (dependents && dependents.length > 0) {
      getDependentUserInfo(dependents, intl)
    }
  }, [dependents, getDependentUserInfo, intl])

  const { companion, observers, primary } = trip

  const iAmThePrimaryTraveler =
    (!primary && trip.userId === loggedInUser?.id) ||
    primary?.userId === loggedInUser?.id

  const primaryTraveler = iAmThePrimaryTraveler
    ? intl.formatMessage({ id: 'components.MobilityProfile.myself' })
    : primary
    ? primary.name || primary.email
    : getDependentName(
        loggedInUser?.dependentsInfo?.find((d) => d.userId === trip.userId)
      )

  return (
    <div>
      <p>
        <FormattedMessage id="components.TripCompanionsPane.primaryLabel" />
        <strong>{primaryTraveler}</strong>
      </p>
      <p>
        <FormattedMessage id="components.TripCompanionsPane.companionLabel" />
        <CompanionSelector
          disabled={isReadOnly || !iAmThePrimaryTraveler}
          excludedUsers={observers}
          onChange={handleCompanionChange}
          selectedCompanions={[companion]}
        />
      </p>
      <p>
        <FormattedMessage id="components.TripCompanionsPane.observersLabel" />
        <CompanionSelector
          disabled={isReadOnly}
          excludedUsers={[companion]}
          multi
          onChange={handleObserversChange}
          selectedCompanions={observers}
        />
      </p>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => ({
  loggedInUser: state.user.loggedInUser
})

const mapDispatchToProps = {
  getDependentUserInfo: userActions.getDependentUserInfo
}

export default connect(mapStateToProps, mapDispatchToProps)(TripCompanions)
