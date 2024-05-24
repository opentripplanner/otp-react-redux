import { connect } from 'react-redux'
import { Popup } from '@opentripplanner/base-map'
import { Search } from '@styled-icons/fa-solid/Search'
import { useIntl, WrappedComponentProps } from 'react-intl'
import { useMap } from 'react-map-gl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import type { Location } from '@opentripplanner/types'

import * as mapActions from '../../actions/map'
import { FocusTrapWrapper } from '@opentripplanner/map-popup/lib'
import { Icon } from '../util/styledIcon'
import { renderCoordinates } from '../../util/i18n'
import { SetLocationHandler, ZoomToPlaceHandler } from '../util/types'

const PopupTitleWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  margin-bottom: 6px;
  width: 100%;
`

const PopupTitle = styled.div`
  flex-grow: 1;
  font-size: 14px;
`

const ZoomButton = styled.button`
  background: none;
  border: none;
  margin-top: -1px;
  padding-top: 0;
`

type Props = {
  clearMapPopupLocation: () => void
  mapPopupLocation: Location
  setLocation: SetLocationHandler
  zoomToPlace: ZoomToPlaceHandler
} & WrappedComponentProps

const DEFAULT_ZOOM = 15

function MapPopup({
  clearMapPopupLocation,
  mapPopupLocation,
  setLocation,
  zoomToPlace
}: Props): JSX.Element | null {
  const intl = useIntl()
  const { current: map } = useMap()

  // Memoize callbacks that shouldn't change from one render to the next.
  const onSetLocationFromPopup = useCallback(
    (payload) => {
      clearMapPopupLocation()
      setLocation(payload)
    },
    [setLocation, clearMapPopupLocation]
  )

  if (!mapPopupLocation) return null

  const popupName =
    mapPopupLocation.name ||
    intl.formatMessage(
      { id: 'common.coordinates' },
      renderCoordinates(intl, mapPopupLocation)
    )
  const zoomButtonLabel = intl.formatMessage({
    id: 'components.PointPopup.zoomToLocation'
  })

  return (
    <Popup
      closeButton={false}
      closeOnClick
      latitude={mapPopupLocation.lat}
      longitude={mapPopupLocation.lon}
      onClose={clearMapPopupLocation}
      // Override inline style supplied by react-map-gl to accommodate long "plan a trip" translations.
      style={{ maxWidth: '260px', width: '260px' }}
    >
      <FocusTrapWrapper closePopup={clearMapPopupLocation} id="stop-popup">
        <PopupTitleWrapper>
          <PopupTitle>
            {typeof popupName === 'string' && popupName.split(',').length > 3
              ? popupName.split(',').splice(0, 3).join(',')
              : popupName}
          </PopupTitle>
          <ZoomButton
            aria-label={zoomButtonLabel}
            id="zoom-btn"
            onClick={() => zoomToPlace(map, mapPopupLocation, DEFAULT_ZOOM)}
            title={zoomButtonLabel}
          >
            <Icon Icon={Search} />
          </ZoomButton>
        </PopupTitleWrapper>
        <div id="from-to">
          <FromToLocationPicker
            label
            location={{ ...mapPopupLocation, name: popupName }}
            setLocation={onSetLocationFromPopup}
          />
        </div>
      </FocusTrapWrapper>
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
  clearMapPopupLocation: mapActions.clearMapPopupLocation,
  setLocation: mapActions.setLocation,
  zoomToPlace: mapActions.zoomToPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(MapPopup)
