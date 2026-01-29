import { connect } from 'react-redux'
import { Distance } from '@opentripplanner/humanize-distance'

import { AppReduxState } from '../../util/state-types'

// Connect to the redux store for unit system presets
// (fall back to imperial to not break existing implementations).
const mapStateToProps = (state: AppReduxState) => {
  const { units = 'imperial' } = state.otp.config
  return {
    // Preset for long units to be consistent with humanizeDistanceString.
    long: units === 'imperial',
    units
  }
}

// Pass an empty object as mapDispatchToProps to remove dispatch from the rendered HTML.
export default connect(mapStateToProps, {})(Distance)
