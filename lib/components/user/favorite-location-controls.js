import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  Input as LocationFieldInput,
  InputGroup as LocationFieldInputGroup
} from '@opentripplanner/location-field/lib/styled'
import React from 'react'
import { InputGroup, MenuItem } from 'react-bootstrap'
import styled from 'styled-components'

import connectLocationField from '../form/connect-location-field'
import Icon from '../narrative/icon'

// Styles
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

/**
 * Displays a dropdown for selecting one of multiple location types.
 */
export const FavoriteLocationTypeDropdown = ({ DropdownButtonComponent, id, onChange, selectedType }) => {
  // Fall back to the 'custom' icon if the desired type is not found.
  const locationType = locationTypes.find(t => t.type === selectedType) || customLocationType

  return (
    <DropdownButtonComponent
      componentClass={InputGroup.Button}
      id={id}
      title={<Icon name={locationType.icon} style={{width: '10px'}} />}
    >
      {locationTypes.map((t, index) => (
        <MenuItem eventKey={t} key={index} onSelect={onChange}>
          <Icon name={t.icon} style={{width: '15px'}} /> {t.text}
        </MenuItem>
      ))}
    </DropdownButtonComponent>
  )
}

// Style and connect LocationField to redux store.
const StyledLocationField = styled(LocationField)`
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
    padding: 6px 12px;
    width: 100%;
  }
`
export const FavoriteLocationField = connectLocationField(StyledLocationField)
