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

import * as mapActions from '../../actions/map'

import connectLocationField from './connect-location-field'

const StyledIntermediatePlace = styled(LocationField)`
  width: 100%;

  ${DropdownContainer} {
    display: table-cell;
    vertical-align: middle;
    width: 1%;
  }

  ${FormGroup} {
    display: table;
    padding: 6px 12px;
    width: 100%;
  }

  ${Input} {
    display: table-cell;
    padding: 6px 12px;
    width: 100%;
  }

  ${InputGroup} {
    width: 100%;
  }

  ${InputGroupAddon} {
    display: table-cell;
    vertical-align: middle;
    width: 1%;
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
    clearLocation: mapActions.clearLocation
  }
})
