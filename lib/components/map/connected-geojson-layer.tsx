import {
  Styled as BaseMapStyled,
  MarkerWithPopup
} from '@opentripplanner/base-map'
import { connect } from 'react-redux'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useEffect, useState } from 'react'

import * as mapActions from '../../actions/map'
import { SetLocationHandler } from '../util/types'

type Props = {
  setLocation: SetLocationHandler
  url: string
}
const GeoJSONOverlay = (props: Props) => {
  const { setLocation, url } = props

  const [locations, setLocations] = useState([])
  useEffect(() => {
    async function downloadLocations() {
      const json = await (await fetch(url)).json()
      setLocations(json)
    }
    if (url) downloadLocations()
  }, [url])

  return (
    <>
      {/* @ts-expect-error TODO: geojson types */}
      {locations?.features?.map((feature, k) => {
        const { geometry, properties } = feature
        if (!geometry || !geometry.coordinates) return null
        return (
          <MarkerWithPopup
            key={k}
            popupContents={
              <BaseMapStyled.MapOverlayPopup>
                {properties.Name && (
                  <BaseMapStyled.PopupTitle>
                    {properties.Name}
                  </BaseMapStyled.PopupTitle>
                )}
                <BaseMapStyled.PopupRow>
                  {properties.popupContent && (
                    <div>{properties.popupContent}</div>
                  )}
                  {properties.Address && (
                    <div>
                      {properties.Address}, {properties.Zip}, {properties.City},{' '}
                      {properties.State}
                    </div>
                  )}
                  {properties.Phone && <div>{properties.Phone}</div>}
                  <FromToLocationPicker
                    label
                    location={{
                      lat: geometry.coordinates[1],
                      lon: geometry.coordinates[0],
                      name: properties.Name
                    }}
                    setLocation={setLocation}
                  />
                </BaseMapStyled.PopupRow>
              </BaseMapStyled.MapOverlayPopup>
            }
            // @ts-expect-error popup props are incorrect
            popupProps={{ offset: 10 }}
            position={[geometry.coordinates[1], geometry.coordinates[0]]}
          >
            <img
              alt={properties.Name}
              className={properties.className}
              src={properties.icon}
            />
          </MarkerWithPopup>
        )
      })}
    </>
  )
}
const mapDispatchToProps = {
  setLocation: mapActions.setLocation
}

export default connect(null, mapDispatchToProps)(GeoJSONOverlay)
