import {
  Styled as BaseMapStyled,
  MarkerWithPopup
} from '@opentripplanner/base-map'
import { connect } from 'react-redux'
import { MapMarker } from '@styled-icons/fa-solid/MapMarker'
import { Stop } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import StopPopup from '@opentripplanner/map-popup'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { AppConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import { getModeFromStop, getStopName } from '../../util/viewer'
import { SetLocationHandler, SetViewedStopHandler } from '../util/types'

interface OwnProps {
  stop: Stop
}

type ModeColors = Record<string, string | undefined>

interface Props extends OwnProps {
  activeStopId?: string
  highlight: boolean
  modeColors: ModeColors
  overrideConfig?: Record<string, string>
  setLocation: SetLocationHandler
  setViewedStop: SetViewedStopHandler
}

interface MarkerProps {
  active?: boolean
  mainColor?: string
}

const iconPixels = 32
const iconPadding = 5
const caretPixels = iconPixels / 2 + iconPadding
const borderPixels = (props: MarkerProps) => (props?.active ? 3 : 1)
const leftPixels = (props: MarkerProps) =>
  caretPixels / 2 - borderPixels(props) / 2
const bottomPixels = (props: MarkerProps) =>
  -((caretPixels * 1.4142) / 4) - borderPixels(props) + iconPadding / 2

const DEFAULT_COLOR = '#a6a6a6'
const strokeColor = (props: MarkerProps) =>
  props?.active ? props.mainColor : DEFAULT_COLOR

const BaseStopIcon = styled.div<MarkerProps>`
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

class EnhancedStopMarker extends Component<Props> {
  static contextType = ComponentContext

  onMarkerClick = () => {
    // Make a copy because getElementsByClassName returns a live collection.
    const closeButtons = Array.from(
      document.getElementsByClassName('maplibregl-popup-close-button')
    )
    // HACK: If an OTP2 tile stop is right underneath the marker, the tile event handler in OTP-UI
    // will fire before this one, and the popup from the regular stop layer will appear
    // (even if we render the StopViewerOverlay after the OTP2 overlays in DefaultMap),
    // so there will be two (duplicate) stop popups.
    // We want to show the popup for the enhanced marker instead of the one from the tile handler
    // because the stop marker has a much larger UI surface than the circle from the tile layer.
    // FIXME: One case that escapes this trick deals with when the active stop marker is below an inactive stop marker.
    // When clicking the corner of the inactive stop marker, this handler is not triggered,
    // and two popups for two different stops will be shown.
    closeButtons.forEach((btn) => {
      const popup = btn.parentElement?.firstChild?.firstChild as HTMLElement
      if (popup?.id !== activeContentId) {
        const button = btn as HTMLButtonElement
        button.click()
      }
    })
  }

  render() {
    const {
      activeStopId,
      highlight,
      modeColors,
      overrideConfig,
      setLocation,
      setViewedStop,
      stop
    } = this.props
    const { id, lat, lon } = stop
    const displayedStopId = coreUtils.itinerary.getDisplayedStopId(stop)
    if (!displayedStopId) return null

    const mode = getModeFromStop(stop, overrideConfig)
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
              <StopPopup
                entity={stop}
                setLocation={setLocation}
                setViewedStop={setViewedStop}
              />
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

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  const { highlightedStop } = state.otp.ui

  const modeColors: ModeColors = {}
  state.otp.config.modes.transitModes.forEach((mode) => {
    modeColors[mode.mode] = mode.color
  })

  return {
    activeStopId: state.otp.ui.viewedStop?.stopId,
    highlight: highlightedStop === ownProps.stop.id,
    modeColors,
    overrideConfig: state.otp.config?.routeModeOverrides
  }
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  setViewedStop: uiActions.setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(EnhancedStopMarker)
