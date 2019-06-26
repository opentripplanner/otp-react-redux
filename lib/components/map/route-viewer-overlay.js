import React from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Polyline } from 'react-leaflet'

function geomToArray (point) {
  return [point.lat, point.lon]
}

class RouteViewerOverlay extends MapLayer {
  static propTypes = {}

  componentDidMount () {}

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount () {}

  componentWillReceiveProps (nextProps) {
    // if pattern geometry just finished populating, update the map points
    if (nextProps.routeData && nextProps.routeData.patterns && Object.keys(nextProps.routeData.patterns).length > 0) {
      const allPoints = Object.values(nextProps.routeData.patterns).reduce(
        (acc, ptn) => acc.concat(ptn.geometry.map(geomToArray)),
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
      const pts = pattern.geometry.map(geomToArray)
      segments.push(
        <Polyline
          positions={pts}
          weight={4}
          color={routeColor}
          opacity={1}
          key={pattern.patternId}
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
    routeData: viewedRoute && state.otp.transitIndex.routes
      ? state.otp.transitIndex.routes[viewedRoute.routeId]
      : null
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(RouteViewerOverlay)
