import { connect } from 'react-redux'
import { Parking } from '@styled-icons/fa-solid'
import { Place } from '@opentripplanner/types'
import { useMap } from 'react-map-gl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useCallback } from 'react'

import * as mapActions from '../../../actions/map'
import { IconWithText } from '../../util/styledIcon'
import { SetLocationHandler } from '../../util/types'

import { Card, CardBody, CardHeader, CardSubheader, CardTitle } from './styled'

type Props = {
  place: Place
  setLocation: SetLocationHandler
  zoomToPlace: (map: any, stopData: any) => void
}

const VehicleParking = ({ place, setLocation, zoomToPlace }: Props) => {
  const map = useMap().default
  const setLocationFromStop = useCallback(
    (locationType: 'from' | 'to') => {
      const location = {
        lat: place.lat,
        lon: place.lon,
        name: place.name
      }
      setLocation({ location, locationType, reverseGeocode: false })
    },
    [place.lat, place.lon, place.name, setLocation]
  )
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
            onFromClick={useCallback(
              () => setLocationFromStop('from'),
              [setLocationFromStop]
            )}
            onToClick={useCallback(
              () => setLocationFromStop('to'),
              [setLocationFromStop]
            )}
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

export default connect(null, mapDispatchToProps)(VehicleParking)
