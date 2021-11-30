import { connect } from 'react-redux'
import DefaultStopMarker from '@opentripplanner/stops-overlay/lib/default-stop-marker'

import { setLocation } from '../../actions/map'
import { setViewedStop } from '../../actions/ui'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { highlightedStop, viewedRoute, viewedStop } = state.otp.ui
  const routeData =
    viewedRoute && state.otp.transitIndex.routes?.[viewedRoute.routeId]
  const hoverColor = routeData?.routeColor || '#333'
  let fillColor = highlightedStop === ownProps.entity.id ? hoverColor : '#FFF'
  if (viewedStop?.stopId === ownProps.entity.id) {
    fillColor = 'cyan'
  }

  return {
    languageConfig: state.otp.config.language,
    leafletPath: {
      color: '#000',
      fillColor,
      fillOpacity: 1,
      weight: 1
    },
    stop: ownProps.entity
  }
}

const mapDispatchToProps = {
  setLocation,
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(DefaultStopMarker)
