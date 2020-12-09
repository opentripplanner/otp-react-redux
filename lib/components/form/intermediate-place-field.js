import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  MenuItemA
} from '@opentripplanner/location-field/lib/styled'
import React, {Component} from 'react'
import styled from 'styled-components'

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

/**
 * Component that leverages LocationField to allow selecting an intermediate
 * place (e.g., stopover on the way from origin to the destination).
 * TODO: move this to otp-ui?
 */
class IntermediatePlaceField extends Component {
  _removeIntermediatePlace = () => {
    const {index, location, onLocationCleared} = this.props
    onLocationCleared && onLocationCleared({location, index})
  }

  render () {
    const {index} = this.props
    return (
      <StyledIntermediatePlace
        {...this.props}
        locationType={`intermediate-place-${index}`}
        clearLocation={this._removeIntermediatePlace} />
    )
  }
}

export default connectLocationField(IntermediatePlaceField)
