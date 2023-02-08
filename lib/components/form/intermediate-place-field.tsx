import {
  DropdownContainer,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  MenuItemA
} from '@opentripplanner/location-field/lib/styled'
import { Location } from '@opentripplanner/types'
import LocationField from '@opentripplanner/location-field'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as formActions from '../../actions/form'

import connectLocationField from './connect-location-field'

// TODO: Merge with connected-location-field.js
const StyledIntermediatePlace = styled(LocationField)`
  width: 100%;

  ${DropdownContainer} {
    display: grid;
    grid-template-columns: 30px 1fr 30px;
  }

  ${FormGroup} {
    display: table;
    padding: 6px 12px;
    width: 100%;
  }

  ${Input} {
    padding: 6px 12px;
  }

  ${InputGroup} {
    width: 100%;
  }

  ${InputGroupAddon} {
    align-self: baseline;
    justify-self: center;
  }

  ${MenuItemA} {
    text-decoration: none;
  }

  ${MenuItemA}:hover {
    color: #333;
  }
`

type Props = {
  index: number
  location: Location
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
 * TODO: move this to otp-ui?
 */
class IntermediatePlaceField extends Component<Props> {
  _removeIntermediatePlace = () => {
    const { index, location, onLocationCleared } = this.props
    onLocationCleared && onLocationCleared({ index, location })
  }

  render() {
    const { index } = this.props
    return (
      <StyledIntermediatePlace
        id="intermediate-place-input"
        {...this.props}
        clearLocation={this._removeIntermediatePlace}
        // @ts-expect-error the location field type is wrong
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
