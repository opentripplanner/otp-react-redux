import { Styled as BaseMapStyled } from '@opentripplanner/base-map'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import { Styled as StopsOverlayStyled } from '@opentripplanner/stops-overlay'
import { divIcon } from 'leaflet'
import React, { Component } from 'react'
import ReactDOMServer from 'react-dom/server'
import { connect } from 'react-redux'
import { Marker, Popup } from 'react-leaflet'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import { ComponentContext } from '../../util/contexts'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { getStopName, getModeFromStop } from '../../util/viewer'
import Icon from '../util/icon'

const { ViewStopButton } = StopsOverlayStyled

const getComplementaryColor = color => color.isLight() ? color.darken(30) : color.lighten(40)

const BaseStopIcon = styled.div`
  background: ${props => props.mainColor};
  border-radius: 5px;
  border: 1px solid ${props => props.secondaryColor};
  color: ${props => props.secondaryColor};
  fill: ${props => props.secondaryColor};
  font-size: 32px;
  height: 32px;
  line-height: 1px;
  padding: 8px;
  width: 32px;

  svg {
    position: relative;
    z-index: 200;
  }

  &::after {
    background: linear-gradient(to bottom right, transparent 0%, transparent 50%, ${props => props.mainColor} 50%, ${props => props.mainColor} 100%);
    border-bottom: 1px solid ${props => props.secondaryColor};
    border-right: 1px solid ${props => props.secondaryColor};
    content: '';
    display: block;
    height: 24px; 
    transform: rotate(45deg);
    width: 24px; 

    /* FIXME: figure out how these numbers can be calculated */
    margin-left: 4px;
    margin-top: -3.75px;
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

  setLocation (locationType) {
    const { setLocation, stop } = this.props
    const { lat, lon, name } = stop
    setLocation({ location: { lat, lon, name }, locationType })
  }

  render () {
    const { activeStopId, hovered, languageConfig, modeColors, stop } = this.props
    const { code, id, lat, lon, name } = stop
    const [, stopId] = id.split(':')
    const stopCode = code || stopId
    if (!stopCode) return null

    const mode = getModeFromStop(stop)
    let color = modeColors && mode in modeColors ? modeColors[mode] : 'pink'
    if (hovered) {
      // Generates a pretty variant of the color
      color = tinycolor(color).monochromatic()[3].toHexString()
    }

    const { ModeIcon } = this.context
    const stopIcon = mode
      ? <ModeIcon mode={mode} />
      : <Icon style={{height: 32, width: 32}} type='map-marker' />

    const icon = divIcon({
      className: '',
      html: ReactDOMServer.renderToStaticMarkup(
        <BaseStopIcon
          active={id === activeStopId}
          mainColor={color}
          secondaryColor={getComplementaryColor(tinycolor(color))}
          // Show actual stop name on hover for easy identification.
          title={getStopName(stop)}
        >
          {stopIcon}
        </BaseStopIcon>
      ),
      // FIXME: make these numbers dependent on the caret size
      iconAnchor: [25, 68]
    })

    return (
      <Marker icon={icon} position={[lat, lon]}>
        <Popup>
          <BaseMapStyled.MapOverlayPopup>
            <BaseMapStyled.PopupTitle>{name}</BaseMapStyled.PopupTitle>
            <BaseMapStyled.PopupRow>
              <span>
                <b>Stop ID:</b> {stopCode}
              </span>
              <ViewStopButton onClick={this.onClickView}>
                {languageConfig.stopViewer || 'Stop Viewer'}
              </ViewStopButton>
            </BaseMapStyled.PopupRow>

            {/* The 'Set as [from/to]' ButtonGroup */}
            <BaseMapStyled.PopupRow>
              <b>Plan a trip:</b>
              <FromToLocationPicker
                onFromClick={this.onFromClick}
                onToClick={this.onToClick}
              />
            </BaseMapStyled.PopupRow>
          </BaseMapStyled.MapOverlayPopup>
        </Popup>
      </Marker>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { highlightedStop } = state.otp.ui

  return {
    activeStopId: state.otp.ui.viewedStop.stopId,
    hovered: highlightedStop === ownProps.entity.id,
    languageConfig: state.otp.config.language,
    modeColors: state.otp.config.stopViewer.colors,
    stop: ownProps.entity
  }
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  setViewedStop: uiActions.setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(EnhancedStopMarker)
