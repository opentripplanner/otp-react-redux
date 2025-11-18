import { FormattedMessage } from 'react-intl'
import React from 'react'

import Distance from '../../util/distance'

import { CardAside } from './styled'

const DistanceDisplay = ({ distance }: { distance?: number }): JSX.Element => {
  if (!distance || distance < 5) return <></>
  return (
    <CardAside>
      <FormattedMessage
        id="components.NearbyView.distanceAway"
        values={{
          localizedDistanceString: <Distance meters={distance} />
        }}
      />
    </CardAside>
  )
}

export default DistanceDisplay
