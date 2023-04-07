import { Location } from '@opentripplanner/types'
import { LocationFieldProps } from '@opentripplanner/location-field/lib/types'
import React, { Component } from 'react'

import * as formActions from '../../actions/form'

import { StyledLocationField } from './styled'
import connectLocationField from './connect-location-field'

interface Props extends LocationFieldProps {
  index: number
  onLocationCleared: ({
    index,
    location
  }: {
    index: number
    location: Location
  }) => void
}

/**
 * Component that leverages LocationField to allow selecting an intermediate
 * place (e.g., stopover on the way from origin to the destination).
 */
class IntermediatePlaceField extends Component<Props> {
  _removeIntermediatePlace = () => {
    const { index, location, onLocationCleared } = this.props
    location && onLocationCleared && onLocationCleared({ index, location })
  }

  render() {
    const { index } = this.props
    return (
      <StyledLocationField
        {...this.props}
        clearLocation={this._removeIntermediatePlace}
        locationType={`intermediate-place-${index}`}
      />
    )
  }
}

export default connectLocationField(IntermediatePlaceField, {
  actions: {
    clearLocation: formActions.clearLocation
  }
})
