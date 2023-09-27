import { Parking } from '@styled-icons/fa-solid'
import { Place } from '@opentripplanner/types'
import React from 'react'

import * as mapActions from '../../../actions/map'
import { connect } from 'react-redux'

import { Card, CardBody, CardHeader } from './styled'
import { IconWithText } from '../../util/styledIcon'

import { useMap } from 'react-map-gl'

type Props = {
  place: Place
  zoomToPlace: (map: any, stopData: any) => void
}

const VehicleParking = ({ place, zoomToPlace }: Props) => {
  const map = useMap().default
  return (
    <Card onMouseEnter={() => zoomToPlace(map, place)}>
      <CardHeader>
        <IconWithText Icon={Parking}>{place.name}</IconWithText>
      </CardHeader>
      <CardBody>test</CardBody>
    </Card>
  )
}

const mapDispatchToProps = {
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: any) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(VehicleParking)
