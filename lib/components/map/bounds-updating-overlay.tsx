import { connect } from 'react-redux'
import { useMap } from 'react-map-gl'
import React, { useEffect } from 'react'

import { setMapCenter } from '../../actions/config'

type Props = {
  map: {
    lat?: number
    lon?: number
    zoom?: number
  }
  setMapCenter: (location: { lat: number | null; lon: number | null }) => void
}
const BoundsUpdatingOverlay = (props: Props): JSX.Element => {
  const { map, setMapCenter } = props
  const { lat, lon, zoom } = map
  const { current: mapGlMap } = useMap()

  useEffect(() => {
    if (lon && lat) {
      const center: [number, number] = [lon, lat]
      mapGlMap?.flyTo({ center, zoom })
      // Reset redux so this componet updates the next time the redux variable updates
      setMapCenter({ lat: null, lon: null })
    }
  }, [lat, lon, setMapCenter, zoom, mapGlMap])

  return <></>
}

// connect to the redux store

const mapStateToProps = (state: any) => {
  return {
    map: state.otp.ui.map
  }
}

const mapDispatchToProps = {
  setMapCenter
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BoundsUpdatingOverlay)
