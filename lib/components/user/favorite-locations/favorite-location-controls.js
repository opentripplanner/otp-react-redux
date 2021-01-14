import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  Input as LocationFieldInput,
  InputGroup as LocationFieldInputGroup
} from '@opentripplanner/location-field/lib/styled'
import React from 'react'
import { DropdownButton, InputGroup, MenuItem } from 'react-bootstrap'
import styled, { css } from 'styled-components'

import connectLocationField from '../../form/connect-location-field'
import Icon from '../../narrative/icon'

/**
 * This module contains components common to the favorite location components.
 */

export const FIELD_HEIGHT_PX = '64px'
export const ICON_WIDTH_PX = '55px'

const customLocationType = {
  icon: 'map-marker',
  text: 'Custom',
  type: 'custom'
}

const locationTypes = [
  // TODO: add more non-home/work types
  {
    icon: 'cutlery',
    text: 'Dining',
    type: 'dining'
  },
  customLocationType
]

const locationTypeCss = css`
  background: transparent;
  border-right: none;
  height: ${FIELD_HEIGHT_PX};
  width: ${ICON_WIDTH_PX};
`

/**
 * A styled input group addon showing the location type icon.
 */
export const FixedLocationType = styled(InputGroup.Addon)`
  ${locationTypeCss}
`

/**
 * A styled input group dropdown showing the location type icon.
 */
const LocationTypeDropdown = styled(DropdownButton)`
  ${locationTypeCss}
`

/**
 * Wrapper for styling around location editing components.
 */
export const LocationNameWrapper = styled.span`
  box-sizing: border-box;
  display: block;
  padding: 0 0px;
  width: 100%;
`

/**
 * An invisible component added to form groups to force the
 * middle form-control element to occupy ther full remaining width.
 */
export const InvisibleAddon = styled(InputGroup.Addon)`
  background: none;
`

/**
 * Creates a new favorite location object from a location returned by LocationField, with the specified type and icon.
 */
export function makeFavoriteLocation (baseLocation, type, icon, nickname) {
  const { lat, lon, name } = baseLocation
  return {
    address: name,
    icon,
    lat,
    lon,
    name: nickname,
    type
  }
}

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

/**
 * Displays a dropdown for selecting one of multiple location types.
 */
export const FavoriteLocationTypeDropdown = ({ id, onChange, selectedType }) => {
  // Fall back to the 'custom' icon if the desired type is not found.
  const locationType = locationTypes.find(t => t.type === selectedType) || customLocationType

  return (
    <LocationTypeDropdown
      componentClass={InputGroup.Button}
      id={id}
      title={<Icon name={locationType.icon} size='2x' style={{width: '24px'}} />}
    >
      {locationTypes.map((t, index) => (
        <MenuItem eventKey={t} key={index} onSelect={onChange}>
          <Icon name={t.icon} style={{width: '15px'}} /> {t.text}
        </MenuItem>
      ))}
    </LocationTypeDropdown>
  )
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
  ${LocationFieldInputGroup} {
    border: none;
    width: 100%;
  }
  ${LocationFieldInput} {
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
 * Styled LocationField for picking favorite locations using the geocoder.
 */
export const FavoriteLocationField = connectLocationField(StyledLocationField)

/**
 * A wrapper of Bootstrap's class 'form-control' to wrap multiple components that display location info,
 * with z-index override needed for showing the location suggestions menu on top of other components.
 */
export const LocationWrapper = ({children, style, ...props}) => (
  <span
    className='form-control'
    style={{
      borderLeft: 'none',
      borderRight: 'none',
      boxShadow: 'none',
      height: FIELD_HEIGHT_PX,
      padding: '0 6px',
      zIndex: 'inherit',
      // Other styles passed in props
      ...style
    }}
    {...props}
  >
    {children}
  </span>
)
