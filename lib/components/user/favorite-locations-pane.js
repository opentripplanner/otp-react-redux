import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  ControlLabel,
  FormControl,
  FormGroup,
  InputGroup
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

// Styles.
const fancyAddLocationCss = `
  background-color: #337ab7;
  color: #fff;
`
const StyledAddon = styled(InputGroup.Addon)`
  min-width: 40px;
`
const NewLocationAddon = styled(StyledAddon)`
  ${fancyAddLocationCss}
`
const NewLocationFormControl = styled(FormControl)`
  ${fancyAddLocationCss}
  ::placeholder {
    color: #fff;
  }
  &:focus {
    background-color: unset;
    color: unset;
    ::placeholder {
      color: unset;
    }
  }
`

// Helper filter functions.
const isHome = loc => loc.type === 'home'
const isWork = loc => loc.type === 'work'
const notHomeOrWork = loc => loc.type !== 'home' && loc.type !== 'work'

/**
 * User's saved locations editor.
 */
class FavoriteLocationsPane extends Component {
  _handleAddNewLocation = e => {
    const value = e.target.value || ''
    if (value.trim().length > 0) {
      const { locations, onLocationsChange } = this.props

      // Create a new array for savedLocations.
      const newLocations = [].concat(locations)

      newLocations.push({
        address: value.trim(),
        icon: 'map-marker',
        type: 'custom'
      })

      // Event onChange will trigger after this and before rerender,
      // so DO empty the input box value so the user can enter their next location.
      e.target.value = null

      onLocationsChange(newLocations)
    }
  }

  _handleAddressChange = location => {
    return e => {
      const { locations, onLocationsChange } = this.props
      const value = e.target.value
      const isValueEmpty = !value || value === ''
      const nonEmptyLocation = isValueEmpty ? null : location

      // Update location address, ohterwise it stalls the input box.
      location.address = value

      // Create a new array for savedLocations.
      let newLocations = []

      // Add home/work as first entries to the new state only if
      // - user edited home/work to non-empty, or
      // - user edited another location and home/work is in savedLocations.
      const homeLocation = (isHome(location) && nonEmptyLocation) || locations.find(isHome)
      if (homeLocation) newLocations.push(homeLocation)

      const workLocation = (isWork(location) && nonEmptyLocation) || locations.find(isWork)
      if (workLocation) newLocations.push(workLocation)

      // Add the rest if it is not home or work
      // and if the new address of this one is not null or empty.
      newLocations = newLocations.concat(locations
        .filter(notHomeOrWork)
        .filter(loc => loc !== location || !isValueEmpty)
      )

      onLocationsChange(newLocations)
    }
  }

  render () {
    const { locations } = this.props

    // Build an 'effective' list of locations for display,
    // where at least one 'home' and one 'work', are always present even if blank.
    // In theory there could be multiple home or work locations.
    // Just pick the first one.
    const homeLocation = locations.find(isHome) || {
      address: null,
      icon: 'home',
      type: 'home'
    }
    const workLocation = locations.find(isWork) || {
      address: null,
      icon: 'briefcase',
      type: 'work'
    }

    const effectiveLocations = [
      homeLocation,
      workLocation,
      ...locations.filter(notHomeOrWork)
    ]

    return (
      <div>
        <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

        {effectiveLocations.map((loc, index) => (
          <FormGroup key={index}>
            <InputGroup>
              <StyledAddon title={loc.type}>
                <FontAwesome name={loc.icon} />
              </StyledAddon>
              <FormControl
                onChange={this._handleAddressChange(loc)}
                placeholder={`Add ${loc.type}`}
                type='text'
                value={loc.address} />
            </InputGroup>
          </FormGroup>
        ))}

        {/* For adding a location. */}
        <FormGroup>
          <InputGroup>
            <NewLocationAddon>
              <FontAwesome name='plus' />
            </NewLocationAddon>
            <NewLocationFormControl
              onBlur={this._handleAddNewLocation}
              placeholder='Add another place'
              type='text'
            />
          </InputGroup>
        </FormGroup>
      </div>
    )
  }
}

FavoriteLocationsPane.propTypes = {
  /** Triggered when the location data is changed. */
  onLocationsChange: PropTypes.func.isRequired,

  /** The list of locations to edit. */
  locations: PropTypes.arrayOf(PropTypes.shape({
    address: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  })).isRequired
}

export default FavoriteLocationsPane
