import { connect } from 'react-redux'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import type { Place } from '@opentripplanner/types'

import { renderCoordinates } from '../form/user-settings'
import { setMapZoom } from '../../actions/config'

const PopupContainer = styled.div`
  width: 240px;
`

const PopupTitle = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
`

function MapPopup({
  intl,
  mapPopupLocation,
  onSetLocationFromPopup,
  setMapZoom,
  zoom
}: {
  mapPopupLocation: Place
  // TODO: add types for this method
  onSetLocationFromPopup: () => void
  setMapZoom: ({ zoom }: { zoom: number }) => void
  zoom: number
} & WrappedComponentProps): JSX.Element {
  // Zoom out if zoomed in very far
  useEffect(() => {
    if (zoom > 15) {
      setMapZoom({ zoom: 15 })
    }
    // Only check zoom if popup appears in a new place
  }, [mapPopupLocation, setMapZoom, zoom])

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

const mapStateToProps = (state: {
  // FIXME: properly type
  otp: { config: { map: { initZoom: number } } }
}) => {
  return { zoom: state.otp.config.map.initZoom }
}

const mapDispatchToProps = {
  setMapZoom
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MapPopup))
