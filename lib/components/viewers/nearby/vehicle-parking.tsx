import { connect } from 'react-redux'
import { Parking } from '@styled-icons/fa-solid'
import { Place } from '@opentripplanner/types'
import { useMap } from 'react-map-gl'
import React from 'react'

import * as mapActions from '../../../actions/map'
import { IconWithText } from '../../util/styledIcon'

import { Card, CardBody, CardHeader, CardSubheader, CardTitle } from './styled'

type Props = {
  fromToSlot: JSX.Element
  place: Place
  zoomToPlace: (map: any, stopData: any) => void
}

const VehicleParking = ({ fromToSlot, place, zoomToPlace }: Props) => {
  const map = useMap().default
  return (
    <Card onMouseEnter={() => zoomToPlace(map, place)}>
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

const mapDispatchToProps = {
  zoomToPlace: mapActions.zoomToPlace
}

export default connect(null, mapDispatchToProps)(VehicleParking)
