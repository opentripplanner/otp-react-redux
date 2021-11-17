import React, {useEffect} from 'react'
import { connect } from 'react-redux'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import styled from 'styled-components'

import { setMapZoom } from '../../actions/config'

const PopupContainer = styled.div`
  width: 240px;
`

const PopupTitle = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
`

function MapPopup ({
  mapPopupLocation,
  onSetLocationFromPopup,
  setMapZoom,
  zoom
}) {
  // Zoom out if zoomed in very far
  useEffect(() => {
    if (zoom > 15) {
      setMapZoom({ zoom: 15 })
    }
    // Only check zoom if popup appears in a new place
  }, [mapPopupLocation])

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

const mapStateToProps = (state, ownProps) => {
  return {zoom: state.otp.config.map.initZoom}
}

const mapDispatchToProps = {
  setMapZoom
}

export default connect(mapStateToProps, mapDispatchToProps)(MapPopup)
