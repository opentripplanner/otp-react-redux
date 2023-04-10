import {
  DropdownButton,
  Input,
  InputGroupAddon,
  MenuItemA,
  MenuItemLi
} from '@opentripplanner/location-field/lib/styled'
import LocationField from '@opentripplanner/location-field'
import styled from 'styled-components'

import connectLocationField from '../../form/connect-location-field'

interface Props {
  static: boolean
}

// Style and connect LocationField to redux store.
const StyledLocationField = styled(LocationField)<Props>`
  border-bottom-color: #ccc;
  display: block;
  margin-bottom: 0;
  width: 100%;

  ${DropdownButton} {
    display: none;
  }

  ${Input} {
    display: table-cell;
    font-size: 100%;
    line-height: 20px;
    padding: 0;
    width: 100%;

    ::placeholder {
      color: #676767;
    }
  }
  ${InputGroupAddon} {
    display: none;
  }
  ${MenuItemA} {
    &:focus,
    &:hover {
      color: inherit;
      text-decoration: none;
    }
  }
  ${MenuItemA}, ${MenuItemLi} {
    ${(props) => (props.static ? 'padding-left: 0; padding-right: 0;' : '')}
  }
`
/**
 * Styled LocationField for setting a favorite place locations using the geocoder.
 */
export const PlaceLocationField = connectLocationField(StyledLocationField, {
  excludeSavedLocations: true
})
