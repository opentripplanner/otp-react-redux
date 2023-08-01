import {
  ClearButton,
  DropdownButton,
  Input,
  MenuItemA,
  MenuItemLi,
  MenuItemList
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

  ${ClearButton},
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
  ${MenuItemList} {
    position: absolute;
    ${(props) => (props.static ? 'width: 100%;' : '')}
  }
  ${MenuItemA} {
    &:focus,
    &:hover {
      color: inherit;
      text-decoration: none;
    }
  }
  ${MenuItemA}, ${MenuItemLi} {
    overflow: hidden;
    ${(props) =>
      props.static ? 'padding-left: 10px; padding-right: 5px; width: 100%' : ''}
  }
`

/**
 * Styled LocationField for setting a favorite place locations using the geocoder.
 */
export const PlaceLocationField = connectLocationField(StyledLocationField, {
  actions: {
    // Set to null so that PlaceEditor can set its own handler.
    getCurrentPosition: null
  },
  excludeSavedLocations: true
})
