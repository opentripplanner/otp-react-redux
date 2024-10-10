import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
import TransitiveCanvasOverlay from '@opentripplanner/transitive-overlay'

import { AppReduxState } from '../../util/state-types'
import { getActiveLeg, getTransitiveData } from '../../util/state'
import { TransitiveConfig } from '../../util/config-types'

type Props = TransitiveConfig & IntlShape

// connect to the redux store
const mapStateToProps = (state: AppReduxState, ownProps: Props) => {
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

  return {
    activeLeg: getActiveLeg(state),
    labeledModes,
    styles,
    // @ts-expect-error typescript is confused by the complex redux reducer. Both params are needed
    transitiveData: getTransitiveData(state, ownProps)
  }
}

// @ts-expect-error state.js being typescripted will fix this error
export default injectIntl(connect(mapStateToProps)(TransitiveCanvasOverlay))
