import { connect } from 'react-redux'
import { Place } from '@opentripplanner/types'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useCallback, useMemo } from 'react'

import * as mapActions from '../../../actions/map'
import { SetLocationHandler } from '../../util/types'

interface Props {
  className?: string
  place: Place
  setLocation: SetLocationHandler
  setLocationMiddleware?: (
    location: any,
    locationType: string,
    reverseGeocode: boolean
  ) => void
}

const FromToPicker = ({
  className,
  place,
  setLocation,
  setLocationMiddleware
}: Props) => {
  const location = useMemo(
    () => ({
      lat: place.lat ?? 0,
      lon: place.lon ?? 0,
      name: place.name
    }),
    [place]
  )

  const handleLocationSet = useCallback(
    (locationType: string) => {
      if (setLocationMiddleware) {
        setLocationMiddleware(location, locationType, false)
      } else {
        setLocation({ location, locationType, reverseGeocode: false })
      }
    },
    [location, setLocation, setLocationMiddleware]
  )

  return (
    <span className={className} role="group">
      <FromToLocationPicker
        label
        onFromClick={useCallback(() => {
          handleLocationSet('from')
        }, [handleLocationSet])}
        onToClick={useCallback(() => {
          handleLocationSet('to')
        }, [handleLocationSet])}
      />
    </span>
  )
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation
}

export default connect(null, mapDispatchToProps)(FromToPicker)
