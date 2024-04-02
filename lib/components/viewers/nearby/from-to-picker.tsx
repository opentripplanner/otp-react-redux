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
}

const FromToPicker = ({ className, place, setLocation }: Props) => {
  const location = useMemo(
    () => ({
      lat: place.lat ?? 0,
      lon: place.lon ?? 0,
      name: place.name
    }),
    [place]
  )
  return (
    <span className={className} role="group">
      <FromToLocationPicker
        label
        onFromClick={useCallback(() => {
          setLocation({ location, locationType: 'from', reverseGeocode: false })
        }, [location, setLocation])}
        onToClick={useCallback(() => {
          setLocation({ location, locationType: 'to', reverseGeocode: false })
        }, [location, setLocation])}
      />
    </span>
  )
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation
}

export default connect(null, mapDispatchToProps)(FromToPicker)
