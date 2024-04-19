import { FormattedMessage, useIntl } from 'react-intl'

import BackLink from '../back-link'
import PageTitle from '../../util/page-title'
import React from 'react'

const TripNotFound = (): JSX.Element => {
  const intl = useIntl()
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
