import { connect } from 'react-redux'
import { Parking } from '@styled-icons/fa-solid'
import { Place } from '@opentripplanner/types'
import React from 'react'

import { IconWithText } from '../../util/styledIcon'
import { useMap } from 'react-map-gl'

import * as mapActions from '../../../actions/map'

import { Card, CardBody, CardHeader, CardSubheader, CardTitle } from './styled'

import FromToLocationPicker from '@opentripplanner/from-to-location-picker'

type Props = {
  place: Place
  setLocation: (args: any) => void
  zoomToPlace: (map: any, stopData: any) => void
}

const VehicleParking = ({ place, setLocation, zoomToPlace }: Props) => {
  const map = useMap().default
  const setLocationFromStop = (locationType: 'from' | 'to') => {
    const location = {
      lat: place.lat,
      lon: place.lon,
      name: place.name
    }
    setLocation({ location, locationType, reverseGeocode: false })
  }
  return (
    <Card onMouseEnter={() => zoomToPlace(map, place)}>
      <CardHeader>
        <CardTitle>
          <IconWithText Icon={Parking}>{place.name}</IconWithText>
        </CardTitle>
        <CardSubheader>Park and Ride</CardSubheader>
      </CardHeader>
      <CardBody>
        <span role="group">
          <FromToLocationPicker
            label
            onFromClick={() => setLocationFromStop('from')}
            onToClick={() => setLocationFromStop('to')}
          />
        </span>
      </CardBody>
    </Card>
  )
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: any) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(VehicleParking)
