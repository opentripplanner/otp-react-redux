import { FormattedMessage, useIntl } from 'react-intl'
import { humanizeDistanceString } from '@opentripplanner/humanize-distance'
import React from 'react'

import { CardAside } from './styled'

const DistanceDisplay = ({ distance }: { distance?: number }): JSX.Element => {
  const intl = useIntl()

  if (!distance || distance < 5) return <></>
  return (
    <CardAside>
      <FormattedMessage
        id="components.NearbyView.distanceAway"
        values={{
          localizedDistanceString: humanizeDistanceString(distance, false, intl)
        }}
      />
    </CardAside>
  )
}

export default DistanceDisplay
