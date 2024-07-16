import { Parking } from '@styled-icons/fa-solid'
import { Place } from '@opentripplanner/types'
import React from 'react'

import { IconWithText } from '../../util/styledIcon'

import { Card, CardBody, CardHeader, CardSubheader, CardTitle } from './styled'
import DistanceDisplay from './distance-display'

type Props = {
  fromToSlot: JSX.Element
  place: Place & { distance?: number }
}

const VehicleParking = ({ fromToSlot, place }: Props): React.ReactElement => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <IconWithText Icon={Parking}>{place.name}</IconWithText>
        </CardTitle>
        <CardSubheader>Park and Ride</CardSubheader>
        <DistanceDisplay distance={place.distance} />
      </CardHeader>
      <CardBody>{fromToSlot}</CardBody>
    </Card>
  )
}

export default VehicleParking
