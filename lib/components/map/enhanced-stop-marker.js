// TYPESCRIPT TODO: all props here are missing types
/* eslint-disable react/prop-types */
import {
  Styled as BaseMapStyled,
  MarkerWithPopup
} from '@opentripplanner/base-map'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Styled as StopsOverlayStyled } from '@opentripplanner/stops-overlay'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { Component } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import { getModeFromStop, getStopName } from '../../util/viewer'
import Icon from '../util/icon'

const { ViewStopButton } = StopsOverlayStyled

const getComplementaryColor = (color) =>
  color.isLight() ? color.darken(30) : color.lighten(40)

const caretPixels = 24
const iconPixels = 32
const iconPadding = 8
const borderPixels = (props) => (props?.thick ? 3 : 1)
const caretVisibleHeight = caretPixels / 1.4142 // Math.sqrt(2)
const caretMarginPixels = (props) =>
  (iconPixels - caretPixels - borderPixels(props)) / 2
const bubblePixels = (props) =>
  iconPixels + iconPadding + 2 * borderPixels(props)

const BaseStopIcon = styled.div`
  background: ${(props) => props.mainColor};
  border-radius: 5px;
  border: ${borderPixels}px solid ${(props) => props.secondaryColor};
  color: ${(props) => props.secondaryColor};
  fill: ${(props) => props.secondaryColor};
  font-size: ${iconPixels}px;
  height: ${iconPixels}px;
  line-height: 1px;
  padding: ${iconPadding}px;
  width: ${iconPixels}px;

  svg {
    position: relative;
    z-index: 200;
  }

  &::after {
    background: linear-gradient(
      to bottom right,
      transparent 0%,
      transparent 40%,
      ${(props) => props.mainColor} 40%,
      ${(props) => props.mainColor} 100%
    );
    border-bottom: ${borderPixels}px solid ${(props) => props.secondaryColor};
    border-right: ${borderPixels}px solid ${(props) => props.secondaryColor};
    content: '';
    display: block;
    height: ${caretPixels}px;
    transform: rotate(45deg);
    width: ${caretPixels}px;

    /* FIXME: figure out how these numbers can be calculated */
    margin-left: ${caretMarginPixels}px;
    margin-top: -${caretMarginPixels}px;
  }
`

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
    const { code, id, lat, lon, name } = stop
    const [, stopId] = id.split(':')
    const stopCode = code || stopId
    if (!stopCode) return null

    const mode = getModeFromStop(stop)
    let color = modeColors && modeColors[mode] ? modeColors[mode] : 'pink'
    if (highlight) {
      // Generates a pretty variant of the color
      color = tinycolor(color).monochromatic()[3].toHexString()
    }

    const { ModeIcon } = this.context
    const stopIcon = mode ? (
      <ModeIcon mode={mode} />
    ) : (
      <Icon style={{ height: 32, width: 32 }} type="map-marker" />
    )

    const icon = (
      <BaseStopIcon
        active={id === activeStopId}
        mainColor={color}
        secondaryColor={getComplementaryColor(tinycolor(color))}
        thick={activeStopId === id}
        // Show actual stop name on hover for easy identification.
        title={getStopName(stop)}
      >
        {stopIcon}
      </BaseStopIcon>
    )

    return (
      <MarkerWithPopup
        markerProps={{ anchor: 'bottom', offset: [1, -12] }}
        popupContents={
          activeStopId !== stop.id && (
            <BaseMapStyled.MapOverlayPopup>
              <BaseMapStyled.PopupTitle>{name}</BaseMapStyled.PopupTitle>
              <BaseMapStyled.PopupRow>
                <span>
                  <b>
                    <FormattedMessage id="components.EnhancedStopMarker.stopID" />
                  </b>{' '}
                  {stopCode}
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
        {icon}
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
    modeColors,
    stop: ownProps.stop
  }
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  setViewedStop: uiActions.setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(EnhancedStopMarker)
