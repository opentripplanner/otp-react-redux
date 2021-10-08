import React from 'react'
// FIXME: typescript
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import styled from 'styled-components'

const PopupContainer = styled.div`
  width: 240px;
`

const PopupTitle = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
`

export default function MapPopup({
  mapPopupLocation,
  onSetLocationFromPopup
}: {
  mapPopupLocation: { name: string }
  // TODO: what is this function actually
  onSetLocationFromPopup: () => void
}): JSX.Element {
  return (
    <PopupContainer>
      <PopupTitle>
        {mapPopupLocation.name.split(',').length > 3
          ? mapPopupLocation.name.split(',').splice(0, 3).join(',')
          : mapPopupLocation.name}
      </PopupTitle>
      <div>
        Plan a trip:
        <FromToLocationPicker
          location={mapPopupLocation}
          setLocation={onSetLocationFromPopup}
        />
      </div>
    </PopupContainer>
  )
}
