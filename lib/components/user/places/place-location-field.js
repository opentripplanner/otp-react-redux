import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  Input,
  InputGroup
} from '@opentripplanner/location-field/lib/styled'
import styled from 'styled-components'

import connectLocationField from '../../form/connect-location-field'

/**
 * Create a LocationField location object from a persisted user location object.
 */
export function makeLocationFieldLocation (favoriteLocation) {
  const { address, lat, lon } = favoriteLocation
  return {
    lat,
    lon,
    name: address
  }
}

// Style and connect LocationField to redux store.
const StyledLocationField = styled(LocationField)`
  margin-bottom: 0;
  width: 100%;
  ${DropdownContainer} {
    width: 0;
    & > button {
      display: none;
    }
  }
  ${InputGroup} {
    border: none;
    width: 100%;
  }
  ${Input} {
    display: table-cell;
    font-size: 100%;
    line-height: 20px;
    padding: 0;
    width: 100%;

    ::placeholder {
      color: #999;
    }
  }
`
/**
 * Styled LocationField for setting a favorite place locations using the geocoder.
 */
export const PlaceLocationField = connectLocationField(StyledLocationField)
