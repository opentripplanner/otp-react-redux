import {
  Styled as BaseMapStyled,
  MarkerWithPopup
} from '@opentripplanner/base-map'
import { connect } from 'react-redux'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useEffect, useState } from 'react'

import * as mapActions from '../../actions/map'
import { SetLocationHandler } from '../util/types'

const DefaultMapIcon = (name: string, className?: string) => (
  <svg
    aria-labelledby="svg-title"
    className={className}
    fill="currentColor"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title id="svg-title">{name}</title>
    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
  </svg>
)

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
            popupProps={{ offset: 10 }}
            position={[geometry.coordinates[1], geometry.coordinates[0]]}
          >
            {properties.icon ? (
              <img
                alt={properties.Name}
                className={properties.className}
                src={properties.icon}
              />
            ) : (
              DefaultMapIcon(properties.Name, properties.className)
            )}
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
