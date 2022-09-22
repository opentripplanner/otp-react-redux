import { useIntl, WrappedComponentProps } from 'react-intl'
import { useMap } from 'react-map-gl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import type { Place } from '@opentripplanner/types'

import { renderCoordinates } from '../form/user-settings'

const PopupContainer = styled.div`
  width: 240px;
`

const PopupTitle = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
`

function MapPopup({
  mapPopupLocation,
  onSetLocationFromPopup
}: {
  mapPopupLocation: Place
  // TODO: add types for this method
  onSetLocationFromPopup: () => void
} & WrappedComponentProps): JSX.Element {
  const intl = useIntl()
  const { current: map } = useMap()
  const currentZoom = map ? map.getZoom() : null
  // Zoom out if zoomed in very far
  useEffect(() => {
    if (currentZoom !== null && currentZoom > 15) {
      map.setZoom(15)
    }
    // Only check zoom if popup appears in a new place
  }, [mapPopupLocation, map, currentZoom])

  const popupName =
    mapPopupLocation?.name ||
    intl.formatMessage(
      { id: 'common.coordinates' },
      renderCoordinates(intl, mapPopupLocation)
    )

  return (
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
  )
}

export default MapPopup
