import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
// @ts-expect-error state.js is not typescripted
import TransitiveCanvasOverlay from '@opentripplanner/transitive-overlay'

import { getTransitiveData } from '../../util/state'

type Props = {
  intl: IntlShape
  labeledModes: string[]
  styles: {
    labels: Record<string, unknown>
    segmentLabels: Record<string, unknown>
  }
}

// connect to the redux store
const mapStateToProps = (state: Record<string, any>, ownProps: Props) => {
  const { labeledModes, styles } = state.otp.config.map.transitive || {}
  const { viewedRoute } = state.otp.ui

  // If the route viewer is active, do not show itinerary on map.
  // mainPanelContent is null whenever the trip planner is active.
  // Some views like the stop viewer can be accessed via the trip planner
  // or the route viewer, so include a route being viewed as a condition
  // for hiding
  if (state.otp.ui.mainPanelContent !== null && viewedRoute) {
    return {}
  }

  const obj = {
    labeledModes,
    styles,
    // @ts-expect-error state.js is not typescripted
    transitiveData: getTransitiveData(state, ownProps)
  } // generate implicit type
  return obj
}

export default injectIntl(connect(mapStateToProps)(TransitiveCanvasOverlay))
