import React, { Component } from 'react'
import {
  Button,
  ControlLabel,
  DropdownButton,
  FormControl,
  FormGroup,
  Glyphicon,
  InputGroup
} from 'react-bootstrap'
import styled from 'styled-components'

import Icon from '../narrative/icon'
import { FavoriteLocationField, FavoriteLocationTypeDropdown } from './favorite-location-controls'

// Styles for other controls
const fieldHeight = '64px'
const iconWidth = '55px'

export const LocationTypeDropdown = styled(DropdownButton)`
  border-right: none;
  height: ${fieldHeight};
  width: ${iconWidth};
`
export const FixedLocationType = styled(InputGroup.Addon)`
  background: transparent;
  border-right: none;
  max-width: ${iconWidth};
  width: ${iconWidth};
`
const LocationNameWrapper = styled.span`
  box-sizing: border-box;
  display: block;
  padding: 0 0px;
  width: 100%;
`
const LocationNameInput = styled(FormControl)`
  border: none;
  border-bottom: 1px solid #eee;
  box-shadow: none;
  font-weight: bold;
  height: inherit;
  padding: 4px 0;
  width: 100%;
`
const FixedLocationName = styled(ControlLabel)`
  border-bottom: 1px solid #eee;
  display: block;
  margin: 0;
  padding: 4px 0;
`
const DeleteWrapper = styled(InputGroup.Button)`
  height: ${fieldHeight};
  & > button {
    border-left: none;
    height: 100%;
  }
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
function makeLocationFieldLocation (favoriteLocation) {
  const { address, lat, lon } = favoriteLocation
  return {
    lat,
    lon,
    name: address
  }
}

/**
 * Renders a user favorite location,
 * and lets the user edit the details (address, type, TODO: nickname) of the location.
 */
class FavoriteLocation extends Component {
  _handleDelete = () => {
    const { arrayHelpers, index, placeholder } = this.props
    if (placeholder) {
      this._handleLocationChange({ location: placeholder })
    } else {
      arrayHelpers.remove(index)
    }
  }

  _handleLocationChange = ({ location }) => {
    const { arrayHelpers, index, location: oldLocation } = this.props
    const { icon, name, type } = oldLocation
    arrayHelpers.replace(index, makeFavoriteLocation(location, type, icon, name))
  }

  _handleLocationNameChange = e => {
    const { arrayHelpers, index, location } = this.props
    const newLocation = {
      ...location,
      name: e.target.value
    }
    arrayHelpers.replace(index, newLocation)
  }

  _handleLocationTypeChange = ({ icon, type }) => {
    const { arrayHelpers, index, location } = this.props
    const newLocation = {
      ...location,
      icon,
      type
    }
    arrayHelpers.replace(index, newLocation)
  }

  render () {
    const { index, location, placeholder } = this.props
    const placeholderText = placeholder ? `Add ${location.type}` : 'Enter a favorite address'

    // Show a dropdown for editing the icon, shown unless a placeholder is set,
    // in which case the type is considered fixed (e.g. for 'home' and 'work' locations).
    // The dropdown has a predefined list of items for location types.
    const iconControl = placeholder
      ? (
        <FixedLocationType title={location.type}>
          <Icon fixedWidth={false} name={location.icon} size='2x' />
        </FixedLocationType>
      )
      : (
        <FavoriteLocationTypeDropdown
          DropdownButtonComponent={LocationTypeDropdown}
          id={`icon-select-${index}`}
          onChange={this._handleLocationTypeChange}
          selectedType={location.type}
        />
      )
    const locationNameContents = placeholder
      ? (
        <FixedLocationName>
          {location.name}
        </FixedLocationName>
      )
      : (
        <LocationNameInput
          onChange={this._handleLocationNameChange}
          placeholder='Enter a nickname for this location'
          value={location.name}
        />
      )

    return (
      <FormGroup>
        <InputGroup>
          {iconControl}
          {/* wrapper with z-index override needed for showing location menu on top of other controls. */}
          <span className='form-control' style={{ borderLeft: 'none', boxShadow: 'none', height: fieldHeight, padding: '0 6px', zIndex: 'inherit' }}>
            <LocationNameWrapper>
              {locationNameContents}
            </LocationNameWrapper>
            <FavoriteLocationField
              inputPlaceholder={placeholderText}
              location={makeLocationFieldLocation(location)}
              locationType='to'
              onLocationSelected={this._handleLocationChange}
              showClearButton={false}
            />
          </span>

          {/* FIXME: hide the delete button for 'home' and 'work' after user clicks it
              (there are challenging layouts).
            */}
          <DeleteWrapper>
            <Button
              aria-label='Delete this location'
              onClick={this._handleDelete}
              title='Delete this location'
            >
              <Glyphicon glyph='trash' />
            </Button>
          </DeleteWrapper>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default FavoriteLocation
