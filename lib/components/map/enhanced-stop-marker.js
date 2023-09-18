// TYPESCRIPT TODO: all props here are missing types
/* eslint-disable react/prop-types */
import {
  Styled as BaseMapStyled,
  MarkerWithPopup
} from '@opentripplanner/base-map'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { MapMarker } from '@styled-icons/fa-solid/MapMarker'
import { Styled as MapPopupStyled } from '@opentripplanner/map-popup'
import coreUtils from '@opentripplanner/core-utils'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { Component } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import { getModeFromStop, getStopName } from '../../util/viewer'

const { ViewStopButton } = MapPopupStyled

const iconPixels = 32
const iconPadding = 5
const caretPixels = iconPixels / 2 + iconPadding
const borderPixels = (props) => (props?.active ? 3 : 1)
const leftPixels = (props) => caretPixels / 2 - borderPixels(props) / 2
const bottomPixels = (props) =>
  -((caretPixels * 1.4142) / 4) - borderPixels(props) + iconPadding / 2

const DEFAULT_COLOR = '#a6a6a6'
const strokeColor = (props) => (props?.active ? props.mainColor : DEFAULT_COLOR)

const BaseStopIcon = styled.div`
  background: #fff;
  border: ${borderPixels}px solid ${strokeColor};
  border-radius: 50%;
  fill: ${strokeColor};
  height: ${iconPixels}px;
  padding: ${iconPadding}px;
  position: relative;
  width: ${iconPixels}px;

  svg {
    max-height: 100%;
    max-width: 100%;
    position: relative;
    z-index: 200;
  }

  &::after {
    background: #fff;
    border-bottom: ${borderPixels}px solid ${strokeColor};
    border-right: ${borderPixels}px solid ${strokeColor};
    bottom: ${bottomPixels}px;
    box-sizing: content-box;
    content: '';
    display: block;
    height: ${caretPixels}px;
    left: ${leftPixels}px;
    position: absolute;
    transform: rotate(45deg);
    width: ${caretPixels}px;
  }
`

const activeContentId = 'enh-stop-popup'

class EnhancedStopMarker extends Component {
  static contextType = ComponentContext

  onClickView = () => {
    const { setViewedStop, stop } = this.props
    setViewedStop({ stopId: stop.id })
  }

  onFromClick = () => {
    this.setLocation('from')
  }

  onToClick = () => {
    this.setLocation('to')
  }

  onMarkerClick = (e) => {
    // Make a copy because getElementsByClassName returns a live collection.
    const elements = Array.from(
      document.getElementsByClassName('maplibregl-popup-close-button')
    )
    // HACK: If an OTP2 tile stop is right underneath the marker, the tile event handler in OTP-UI
    // will fire before this one, and the popup from the regular stop layer will appear
    // (even if we render the StopViewerOverlay after the OTP2 overlays in DefaultMap),
    // so there will be two (duplicate) stop popups.
    // We want to show the popup for the enhanced marker instead of the one from the tile handler
    // because the stop marker has a much larger UI surface than the circle from the tile layer.
    elements.forEach((el) => {
      if (el.parentElement.firstChild.firstChild.id !== activeContentId) {
        el.click()
      }
    })
  }

  setLocation(locationType) {
    const { setLocation, stop } = this.props
    const { lat, lon, name } = stop
    setLocation({
      location: { lat, lon, name },
      locationType,
      reverseGeocode: false
    })
  }

  render() {
    const { activeStopId, highlight, languageConfig, modeColors, stop } =
      this.props
    const { id, lat, lon, name } = stop
    const displayedStopId = coreUtils.itinerary.getDisplayedStopId(stop)
    if (!displayedStopId) return null

    const mode = getModeFromStop(stop)
    let color = modeColors && modeColors[mode] ? modeColors[mode] : '#121212'
    if (highlight) {
      // Generates a pretty variant of the color
      color = tinycolor(color).monochromatic()[3].toHexString()
    }

    const { ModeIcon } = this.context
    const stopIcon = mode ? <ModeIcon mode={mode} /> : <MapMarker size={32} />

    return (
      <MarkerWithPopup
        popupContents={
          activeStopId !== stop.id && (
            <BaseMapStyled.MapOverlayPopup id={activeContentId}>
              <BaseMapStyled.PopupTitle>{name}</BaseMapStyled.PopupTitle>
              <BaseMapStyled.PopupRow>
                <span>
                  <b>
                    <FormattedMessage id="components.EnhancedStopMarker.stopID" />
                  </b>{' '}
                  {displayedStopId}
                </span>
                <ViewStopButton onClick={this.onClickView}>
                  {languageConfig.stopViewer || (
                    <FormattedMessage id="components.EnhancedStopMarker.stopViewer" />
                  )}
                </ViewStopButton>
              </BaseMapStyled.PopupRow>

              {/* The 'Set as [from/to]' ButtonGroup */}
              <BaseMapStyled.PopupRow>
                <FromToLocationPicker
                  label
                  onFromClick={this.onFromClick}
                  onToClick={this.onToClick}
                />
              </BaseMapStyled.PopupRow>
            </BaseMapStyled.MapOverlayPopup>
          )
        }
        position={[lat, lon]}
      >
        <BaseStopIcon
          active={id === activeStopId}
          mainColor={color}
          onClick={this.onMarkerClick}
          // Show actual stop name on hover for easy identification.
          title={getStopName(stop)}
        >
          {stopIcon}
        </BaseStopIcon>
      </MarkerWithPopup>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { highlightedStop } = state.otp.ui

  const transitModes = state.otp.config.modes.transitModes
  const modeColors = {}
  transitModes.forEach((mode) => {
    modeColors[mode.mode] = mode.color
  })

  return {
    activeStopId: state.otp.ui.viewedStop?.stopId,
    highlight: highlightedStop === ownProps.stop.id,
    languageConfig: state.otp.config.language,
    modeColors
  }
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  setViewedStop: uiActions.setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(EnhancedStopMarker)
