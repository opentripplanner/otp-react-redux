import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  MenuItemA
} from '@opentripplanner/location-field/lib/styled'
import styled from 'styled-components'

import connectLocationField from './connect-location-field'

const StyledLocationField = styled(LocationField)`
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

export default connectLocationField(StyledLocationField)
