import { connect } from 'react-redux'
import { GeolocateControl, NavigationControl } from 'react-map-gl'
import { Itinerary } from '@opentripplanner/types'
import { useIntl } from 'react-intl'
import BaseMap from '@opentripplanner/base-map'
import EndpointsOverlay from '@opentripplanner/endpoints-overlay'
import React, { useContext } from 'react'
import styled from 'styled-components'
import TransitiveOverlay, {
  itineraryToTransitive
} from '@opentripplanner/transitive-overlay'

import { AppConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'

interface Props {
  config: AppConfig
  itinerary: Itinerary
}

const MapContainer = styled.div`
  height: 100%;
  width: 100%;

  .map {
    height: 100%;
    width: 100%;
  }
`

function noop() {
  return null
}

const DefaultMap = ({ config, itinerary }: Props): JSX.Element => {
  const intl = useIntl()
  // @ts-expect-error ComponentContext not typed yet.
  const { getTransitiveRouteLabel } = useContext(ComponentContext)
  const {
    baseLayers,
    initLat = 0,
    initLon = 0,
    initZoom,
    maxZoom,
    navigationControlPosition,
    transitive
  } = config.map || {}
  const baseLayerUrls = baseLayers?.map((bl) => bl.url)
  const { disableFlexArc } = transitive || {}
  const { legs } = itinerary

  return (
    <MapContainer className="percy-hide">
      <BaseMap
        baseLayer={
          (baseLayerUrls?.length || 0) > 1 ? baseLayerUrls : baseLayerUrls?.[0]
        }
        center={[initLat, initLon]}
        mapLibreProps={{ reuseMaps: true }}
        maxZoom={maxZoom}
        zoom={initZoom}
      >
        <EndpointsOverlay
          fromLocation={legs[0]?.from}
          setLocation={noop}
          toLocation={legs[legs.length - 1]?.to}
        />
        <GeolocateControl position="top-left" />
        <TransitiveOverlay
          transitiveData={itineraryToTransitive(itinerary, {
            companies: config.companies,
            disableFlexArc,
            getRouteLabel: getTransitiveRouteLabel,
            intl
          })}
        />

        <NavigationControl
          position={navigationControlPosition || 'bottom-right'}
        />
      </BaseMap>
    </MapContainer>
  )
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => ({
  config: state.otp.config
})

export default connect(mapStateToProps)(DefaultMap)
