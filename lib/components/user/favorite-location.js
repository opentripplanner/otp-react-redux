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
import { isHome, isWork } from '../../util/user'
import { FavoriteLocationField, FavoriteLocationTypeDropdown } from './favorite-location-controls'

// Styles for other controls
const StyledDropdown = styled(DropdownButton)`
  background-color: #eee;
  width: 40px;
`
const StyledAddon = styled(InputGroup.Addon)`
  width: 40px;
`

// Defaults for home and work
export const BLANK_HOME = {
  address: '',
  icon: 'home',
  name: '',
  type: 'home'
}
export const BLANK_WORK = {
  address: '',
  icon: 'briefcase',
  name: '',
  type: 'work'
}

/**
 * Creates a new favorite location object from a location returned by LocationField, with the specified type and icon.
 */
function makeFavoriteLocation (baseLocation, type, icon) {
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
  constructor () {
    super()
    this.state = {
      newLocation: null
    }
  }

  _handleDelete = () => {
    const { arrayHelpers, index, isFixed, location } = this.props
    if (isFixed) {
      // For 'Home' and 'Work', replace with the default blank locations instead of deleting.
      let newLocation
      if (isHome(location)) {
        newLocation = BLANK_HOME
      } else if (isWork(location)) {
        newLocation = BLANK_WORK
      }

      this._handleLocationChange({ location: newLocation })
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

  _handleNew = ({ location }) => {
    const { arrayHelpers } = this.props

    // Set, then unset the location state to reset the LocationField after address is entered.
    // (both this.setState calls should trigger componentDidUpdate on LocationField).
    this.setState({ newLocation: location })

    arrayHelpers.push(makeFavoriteLocation(location, 'custom', 'map-marker'))

    this.setState({ newLocation: null })
  }

  render () {
    const { index, isFixed, location } = this.props
    const placeholder = isFixed ? `Add ${location.type}` : 'Enter a favorite address'

    // Show a dropdown for editing the icon, unless isFixed = true (for 'home' and 'work' locations).
    // The dropdown has a predefined list of items for location types.
    const iconControl = isFixed
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
              inputPlaceholder={placeholder}
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
