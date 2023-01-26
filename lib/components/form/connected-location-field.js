import {
  DropdownContainer,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  MenuItemA
} from '@opentripplanner/location-field/lib/styled'
import LocationField from '@opentripplanner/location-field'
import styled from 'styled-components'

import * as mapActions from '../../actions/map'

import connectLocationField from './connect-location-field'

const StyledLocationField = styled(LocationField)`
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

export default connectLocationField(StyledLocationField, {
  actions: {
    clearLocation: mapActions.clearLocation,
    onLocationSelected: mapActions.onLocationSelected
  },
  includeLocation: true
})
