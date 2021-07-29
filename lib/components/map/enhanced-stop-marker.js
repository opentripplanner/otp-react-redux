import { styled as BaseMapStyled } from '@opentripplanner/base-map'
import coreUtils from '@opentripplanner/core-utils'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import { divIcon } from 'leaflet'
import React, { Component } from 'react'
import ReactDOMServer from 'react-dom/server'
import { connect } from 'react-redux'
import { Marker, Popup } from 'react-leaflet'
import styled from 'styled-components'

import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { getStopName } from '../../util/viewer'

const { getTextWidth } = coreUtils.itinerary

const BaseStopIcon = styled.div`
  background: #fff;
  border: ${props => props.active ? '#000 3px' : '#333 1px'} solid;
  border-radius: 17px;
  color: #000;
  font-size: 16px;
  font-weight: bold;
  height: 12px;
  line-height: 0px;
  padding-left: 7px;
  padding-top: 12px;
  width: ${props => `${props.width || 12}px`}
`

class EnhancedStopMarker extends Component {
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
    const { activeStopId, languageConfig, stop } = this.props
    const { code, id, lat, lon, name } = stop
    const [, stopId] = id.split(':')
    const stopCode = code || stopId
    const routeShortNames = stop.routes?.map(r => r.shortName).join(' ')
    const stopLabel = routeShortNames || ''
    if (!stopLabel) return null
    const width = getTextWidth(stopLabel) * 0.83 + 80 / getTextWidth(stopLabel)
    const icon = divIcon({
      className: '',
      html: ReactDOMServer.renderToStaticMarkup(
        <BaseStopIcon
          active={id === activeStopId}
          // Show actual stop name on hover for easy identification.
          title={getStopName(stop)}
          width={width}
        >
          {stopLabel}
        </BaseStopIcon>
      ),
      iconAnchor: [(width / 2), 10]
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
              <button onClick={this.onClickView}>
                {languageConfig.stopViewer || 'Stop Viewer'}
              </button>
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
  return {
    activeStopId: state.otp.ui.viewedStop.stopId,
    languageConfig: state.otp.config.language,
    stop: ownProps.entity
  }
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  setViewedStop: uiActions.setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(EnhancedStopMarker)
