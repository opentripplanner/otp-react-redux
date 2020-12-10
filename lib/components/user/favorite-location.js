import React, { Component } from 'react'
import {
  Button,
  DropdownButton,
  FormGroup,
  Glyphicon,
  InputGroup
} from 'react-bootstrap'
import styled from 'styled-components'

import Icon from '../narrative/icon'
import { FavoriteLocationField, FavoriteLocationTypeDropdown } from './favorite-location-controls'

// Styles for other controls
const StyledDropdown = styled(DropdownButton)`
  background-color: #eee;
  width: 40px;
`
const StyledAddon = styled(InputGroup.Addon)`
  width: 40px;
`

/**
 * Creates a new favorite location object from a location returned by LocationField, with the specified type and icon.
 */
export function makeFavoriteLocation (baseLocation, type, icon) {
  const { lat, lon, name } = baseLocation
  return {
    address: name,
    icon,
    lat,
    lon,
    name,
    type
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
    const { icon, type } = oldLocation
    arrayHelpers.replace(index, makeFavoriteLocation(location, type, icon))
  }

  _handleLocationTypeChange = ({ icon, type }) => {
    const { arrayHelpers, index, location } = this.props
    arrayHelpers.replace(index, makeFavoriteLocation(location, type, icon))
  }

  render () {
    const { index, location, placeholder } = this.props
    const placeholderText = placeholder ? `Add ${location.type}` : 'Enter a favorite address'

    // Show a dropdown for editing the icon, shown unless a placeholder is set,
    // in which case the type is considered fixed (e.g. for 'home' and 'work' locations).
    // The dropdown has a predefined list of items for location types.
    const iconControl = placeholder
      ? (
        <StyledAddon title={location.type}>
          <Icon fixedWidth={false} name={location.icon} />
        </StyledAddon>
      )
      : (
        <FavoriteLocationTypeDropdown
          DropdownButtonComponent={StyledDropdown}
          id={`icon-select-${index}`}
          onChange={this._handleLocationTypeChange}
          selectedType={location.type}
        />
      )

    return (
      <FormGroup>
        <InputGroup>
          {iconControl}
          {/* wrapper with z-index override needed for showing location menu on top of other controls. */}
          <span className='form-control' style={{ padding: 0, zIndex: 'inherit' }}>
            <FavoriteLocationField
              inputPlaceholder={placeholderText}
              location={location}
              locationType='to'
              onLocationSelected={this._handleLocationChange}
              showClearButton={false}
            />
          </span>

          {/* FIXME: hide the delete button for 'home' and 'work' after user clicks it
              (there are challenging layouts).
            */}
          <InputGroup.Button>
            <Button
              aria-label='Delete this location'
              onClick={this._handleDelete}
              title='Delete this location'
            >
              <Glyphicon glyph='trash' />
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default FavoriteLocation
