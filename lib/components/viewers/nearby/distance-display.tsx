import { connect } from 'react-redux'
import { Distance } from '@opentripplanner/humanize-distance'
import { FormattedMessage } from 'react-intl'
import { UnitSystem } from '@opentripplanner/types'
import React from 'react'

import { AppReduxState } from '../../../util/state-types'

import { CardAside } from './styled'

const DistanceDisplay = ({
  distance,
  units = 'imperial'
}: {
  distance?: number
  units?: UnitSystem
}): JSX.Element => {
  if (!distance || distance < 5) return <></>
  return (
    <CardAside>
      <FormattedMessage
        id="components.NearbyView.distanceAway"
        values={{
          localizedDistanceString: (
            <Distance
              long={units === 'imperial'}
              meters={distance}
              units={units}
            />
          )
        }}
      />
    </CardAside>
  )
}

// connect to the redux store for unit system presets.
const mapStateToProps = (state: AppReduxState) => ({
  units: state.otp.config.units
})

// Pass an empty object as mapDispatchToProps to remove dispatch from the rendered HTML.
export default connect(mapStateToProps, {})(DistanceDisplay)
