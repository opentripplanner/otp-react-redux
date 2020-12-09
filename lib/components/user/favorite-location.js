import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  Input as LocationFieldInput,
  InputGroup as LocationFieldInputGroup
} from '@opentripplanner/location-field/lib/styled'
import React, { Component } from 'react'
import {
  Button,
  DropdownButton,
  FormGroup,
  Glyphicon,
  InputGroup,
  MenuItem
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

import connectLocationField from '../form/connect-location-field'

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
const FavoriteLocationField = connectLocationField(StyledLocationField)

// Styles for other controls
const StyledDropdown = styled(DropdownButton)`
  background-color: #eee;
  width: 40px;
`
const NewLocationDropdownButton = styled(StyledDropdown)`
  background-color: #337ab7;
  color: #fff;
`
const StyledAddon = styled(InputGroup.Addon)`
  width: 40px;
`

// Helper filter functions.
export const isHome = loc => loc.type === 'home'
export const isWork = loc => loc.type === 'work'

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
    const { index, isFixed, isNew } = this.props

    // When true, isNew makes the control add a new location instead of editing an existing one.
    // The appearance is also different to differentiate the control with others.
    let icon
    let iconTitle
    let handler
    // Don't display a delete button if the item is fixed and its address is blank,
    // or for the new location row.
    let hideDelete
    let location
    let placeholder
    let DropdownBtn
    if (isNew) {
      location = this.state.newLocation
      icon = 'plus'
      iconTitle = null
      handler = this._handleNew
      hideDelete = true
      placeholder = 'Add another place'
      DropdownBtn = NewLocationDropdownButton
    } else {
      location = this.props.location
      // TODO: lookup icon using location.type
      icon = location.icon
      iconTitle = location.type
      handler = this._handleLocationChange
      hideDelete = false // isFixed && isBlank(location.address)
      placeholder = isFixed ? `Add ${location.type}` : 'Enter a favorite address'
      DropdownBtn = StyledDropdown
    }

    // Show a dropdown for editing the icon, unless isFixed = true (for 'home' and 'work' locations).
    // The dropdown has a predefined list of items for location types.
    const iconControl = isFixed
      ? (
        <StyledAddon title={iconTitle}>
          <FontAwesome name={icon} />
        </StyledAddon>
      )
      : (
        <LocationTypeSelector
          DropdownButtonComponent={DropdownBtn}
          id={`icon-select-${index}`}
          onChange={this._handleLocationTypeChange}
          selectedType={location ? location.type : 'custom'}
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
              onLocationSelected={handler}
              showClearButton={false}
            />
          </span>

          {/* FIXME: hide the delete button for 'home' and 'work' after user clicks it
              (there are challenging layouts).
            */}
          {!hideDelete && (
            <InputGroup.Button>
              <Button
                aria-label='Delete this location'
                onClick={this._handleDelete}
                title='Delete this location'
              >
                <Glyphicon glyph='trash' />
              </Button>
            </InputGroup.Button>
          )}
        </InputGroup>
      </FormGroup>
    )
  }
}

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
const LocationTypeSelector = ({ DropdownButtonComponent, id, onChange, selectedType }) => {
  // Fall back to the 'custom' icon if the desired type is not found.
  const locationType = locationTypes.find(t => t.type === selectedType) || customLocationType

  return (
    <DropdownButtonComponent
      componentClass={InputGroup.Button}
      id={id}
      title={<FontAwesome name={locationType.icon} style={{width: '10px'}} />}
    >
      {locationTypes.map((t, index) => (
        <MenuItem eventKey={t} key={index} onSelect={onChange}>
          <FontAwesome name={t.icon} style={{width: '15px'}} /> {t.text}
        </MenuItem>
      ))}
    </DropdownButtonComponent>
  )
}

export default FavoriteLocation
