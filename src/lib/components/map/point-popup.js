import React from 'react'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import styled from 'styled-components'

const PopupContainer = styled.div`
  width: 240px;
`

const PopupTitle = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
`

export default function MapPopup ({
  mapPopupLocation,
  onSetLocationFromPopup
}) {
  return (
    <PopupContainer>
      <PopupTitle>
        {mapPopupLocation.name.split(',').length > 3
          ? mapPopupLocation.name.split(',').splice(0, 3).join(',')
          : mapPopupLocation.name
        }
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
