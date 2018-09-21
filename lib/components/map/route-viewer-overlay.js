import React from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Polyline } from 'react-leaflet'

import polyline from '@mapbox/polyline'

class RouteViewerOverlay extends MapLayer {
  static propTypes = {}

  componentDidMount () {}

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount () {}

  componentWillReceiveProps (nextProps) {
    // helper fn to check if geometry has been populated for all patterns in route
    const isGeomComplete = routeData => {
      return (
        routeData &&
        routeData.patterns &&
        Object.values(routeData.patterns).reduce(
          (acc, ptn) => acc && typeof ptn.geometry !== 'undefined',
          true
        )
      )
    }

    // if pattern geometry just finished populating, update the map points
    if (
      !isGeomComplete(this.props.routeData) &&
      isGeomComplete(nextProps.routeData)
    ) {
      const allPoints = Object.values(nextProps.routeData.patterns).reduce(
        (acc, ptn) => {
          return acc.concat(polyline.decode(ptn.geometry.points))
        },
        []
      )
      this.context.map.fitBounds(allPoints)
    }
  }

  createLeafletElement () {}

  updateLeafletElement () {}

  render () {
    const { routeData } = this.props

    if (!routeData || !routeData.patterns) return <FeatureGroup />

    const routeColor = routeData.color ? `#${routeData.color}` : '#00bfff'
    const segments = []
    Object.values(routeData.patterns).forEach(pattern => {
      if (!pattern.geometry) return
      const pts = polyline.decode(pattern.geometry.points)
      segments.push(
        <Polyline
          positions={pts}
          weight={4}
          color={routeColor}
          opacity={1}
          key={pattern.id}
        />
      )
    })

    return segments.length > 0
      ? <FeatureGroup><div>{segments}</div></FeatureGroup>
      : <FeatureGroup />
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedRoute = state.otp.ui.viewedRoute
  return {
    viewedRoute,
    routeData: viewedRoute
      ? state.otp.transitIndex.routes[viewedRoute.routeId]
      : null
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(RouteViewerOverlay)
