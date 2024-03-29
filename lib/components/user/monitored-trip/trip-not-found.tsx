import { FormattedMessage, IntlShape } from 'react-intl'

import BackLink from '../back-link'
import PageTitle from '../../util/page-title'
import React, { ReactComponentElement } from 'react'

interface Props {
  intl: IntlShape
}

const TripNotFound = ({ intl }: Props): JSX.Element => {
  const tripNotFound = intl.formatMessage({
    id: 'components.SavedTripEditor.tripNotFound'
  })
  return (
    <>
      <BackLink />
      <PageTitle title={tripNotFound} />
      <h1>{tripNotFound}</h1>
      <p>
        <FormattedMessage id="components.SavedTripEditor.tripNotFoundDescription" />
      </p>
    </>
  )
}

export default TripNotFound
