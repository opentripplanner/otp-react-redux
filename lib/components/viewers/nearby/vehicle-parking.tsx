import { Parking } from '@styled-icons/fa-solid'
import { Place } from '@opentripplanner/types'
import React from 'react'

import { IconWithText } from '../../util/styledIcon'

import { Card, CardBody, CardHeader, CardSubheader, CardTitle } from './styled'

type Props = {
  fromToSlot: JSX.Element
  place: Place
}

const VehicleParking = ({ fromToSlot, place }: Props): React.ReactElement => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <IconWithText Icon={Parking}>{place.name}</IconWithText>
        </CardTitle>
        <CardSubheader>Park and Ride</CardSubheader>
      </CardHeader>
      <CardBody>{fromToSlot}</CardBody>
    </Card>
  )
}

export default VehicleParking
