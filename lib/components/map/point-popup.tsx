import { connect } from 'react-redux'
import { Popup, useMap } from 'react-map-gl'
import { useIntl, WrappedComponentProps } from 'react-intl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import type { Location } from '@opentripplanner/types'

import * as mapActions from '../../actions/map'
import { renderCoordinates } from '../form/user-settings'

const PopupContainer = styled.div`
  width: 240px;
`

const PopupTitle = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
`

type Props = {
  mapPopupLocation: Location
  onSetLocationFromPopup: () => void
  setMapPopupLocation: (arg: { location: Location | null }) => void
} & WrappedComponentProps

function MapPopup({
  mapPopupLocation,
  onSetLocationFromPopup,
  setMapPopupLocation
}: Props): JSX.Element | null {
  const intl = useIntl()
  const { current: map } = useMap()
  const currentZoom = map ? map.getZoom() : null

  // Zoom out if zoomed in very far
  useEffect(() => {
    if (map && mapPopupLocation && currentZoom !== null && currentZoom > 15) {
      map.setZoom(15)
    }
    // Only check zoom if popup appears in a new place
  }, [mapPopupLocation, map, currentZoom])

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
      onClose={() => setMapPopupLocation({ location: null })}
    >
      <PopupContainer>
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
      </PopupContainer>
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
  setMapPopupLocationAndGeocode: mapActions.setMapPopupLocationAndGeocode
}

export default connect(mapStateToProps, mapDispatchToProps)(MapPopup)
