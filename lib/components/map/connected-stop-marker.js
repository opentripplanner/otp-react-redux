import DefaultStopMarker from '@opentripplanner/stops-overlay/lib/default-stop-marker'
import { connect } from 'react-redux'

import { setLocation } from '../../actions/map'
import { setViewedStop } from '../../actions/ui'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { highlightedStop, viewedRoute } = state.otp.ui
  const routeData = viewedRoute && state.otp.transitIndex.routes?.[viewedRoute.routeId]
  const hoverColor = routeData?.routeColor || '#333'

  return {
    languageConfig: state.otp.config.language,
    leafletPath: {
      color: '#000',
      fillColor: highlightedStop === ownProps.entity.id ? hoverColor : '#FFF',
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
