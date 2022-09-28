import { connect } from 'react-redux'
import { Popup as MapGlPopup, MapRef, useMap } from 'react-map-gl'
import { Search } from '@styled-icons/fa-solid/Search'
import { useIntl, WrappedComponentProps } from 'react-intl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import type { Location } from '@opentripplanner/types'

import * as mapActions from '../../actions/map'
import { Icon } from '../util/styledIcon'
import { renderCoordinates } from '../form/user-settings'

/**
 * Adds a box shadow and tweaks border radius to make popups easier to read.
 */
const Popup = styled(MapGlPopup)`
  & > .maplibregl-popup-content,
  & > .mapboxgl-popup-content {
    border-radius: 6px;
    box-shadow: 0 3px 14px rgb(0 0 0 / 40%);
  }
`

const PopupTitle = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
`

const ZoomButton = styled.button`
  background: none;
  border: none;
  padding-top: 0;
`

type Props = {
  mapPopupLocation: Location
  onSetLocationFromPopup: () => void
  setMapPopupLocation: (arg: { location: Location | null }) => void
  zoomToPlace: (
    map: MapRef,
    place: { lat: number; lon: number },
    zoom?: number
  ) => void
} & WrappedComponentProps

const DEFAULT_ZOOM = 15

function MapPopup({
  mapPopupLocation,
  onSetLocationFromPopup,
  setMapPopupLocation,
  zoomToPlace
}: Props): JSX.Element | null {
  const intl = useIntl()
  const { current: map } = useMap()
  const currentZoom = map ? map.getZoom() : null

  // Zoom out if zoomed in very far
  useEffect(() => {
    if (
      map &&
      mapPopupLocation &&
      currentZoom !== null &&
      currentZoom > DEFAULT_ZOOM
    ) {
      map.setZoom(DEFAULT_ZOOM)
    }
    // Only check zoom if popup appears in a new place
  }, [mapPopupLocation, map, currentZoom])

  // Memoize this callback because it shouldn't change (unlike the zoom click one).
  const onPopupClose = useCallback(
    () => setMapPopupLocation({ location: null }),
    [setMapPopupLocation]
  )

  if (!mapPopupLocation) return null

  const popupName =
    mapPopupLocation.name ||
    intl.formatMessage(
      { id: 'common.coordinates' },
      renderCoordinates(intl, mapPopupLocation)
    )

  return (
    <Popup
      closeButton={false}
      closeOnClick
      latitude={mapPopupLocation.lat}
      longitude={mapPopupLocation.lon}
      onClose={onPopupClose}
    >
      <ZoomButton
        className="pull-right"
        onClick={() => zoomToPlace(map, mapPopupLocation, DEFAULT_ZOOM)}
        title="Zoom to location"
      >
        <Icon Icon={Search} />
      </ZoomButton>
      <PopupTitle>
        {typeof popupName === 'string' && popupName.split(',').length > 3
          ? popupName.split(',').splice(0, 3).join(',')
          : popupName}
      </PopupTitle>
      <div>
        <FromToLocationPicker
          label
          location={{ ...mapPopupLocation, name: popupName }}
          setLocation={onSetLocationFromPopup}
        />
      </div>
    </Popup>
  )
}

// connect to the redux store

const mapStateToProps = (state: any) => {
  return {
    mapPopupLocation: state.otp.ui.mapPopupLocation
  }
}

const mapDispatchToProps = {
  setMapPopupLocation: mapActions.setMapPopupLocation,
  setMapPopupLocationAndGeocode: mapActions.setMapPopupLocationAndGeocode,
  zoomToPlace: mapActions.zoomToPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(MapPopup)
