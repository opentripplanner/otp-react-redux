import { FieldArray } from 'formik'
import {
  DropdownContainer,
  Input as LocationFieldInput,
  InputGroup as LocationFieldInputGroup
} from '@opentripplanner/location-field/lib/styled'
import React, { Component } from 'react'
import {
  Button,
  ControlLabel,
  FormGroup,
  Glyphicon,
  InputGroup
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

import LocationField from '../form/connected-location-field'
import { isBlank } from '../../util/ui'

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
  }
  ${LocationFieldInput} {
    border: 1px solid #ccc;
    border-bottom-right-radius 4px;
    border-top-right-radius 4px;
    font-size: 100%;
    line-height: 20px;
    padding: 6px 12px;
    width: 100%;
  }
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
 * User's saved locations editor.
 */
class FavoriteLocationsPane extends Component {
  render () {
    const { values: userData } = this.props
    const { savedLocations } = userData
    const homeLocation = savedLocations.find(isHome)
    const workLocation = savedLocations.find(isWork)

    return (
      <div>
        <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

        <FieldArray
          name='savedLocations'
          render={arrayHelpers => (
            <>
              {savedLocations.map((loc, index) => {
                const isHomeOrWork = loc === homeLocation || loc === workLocation
                return (
                  <FavoriteLocation
                    arrayHelpers={arrayHelpers}
                    index={index}
                    isFixed={isHomeOrWork}
                    key={index}
                    location={loc}
                  />
                )
              })}

              {/* For adding a location. */}
              <FavoriteLocation
                arrayHelpers={arrayHelpers}
                isNew
              />
            </>
          )}
        />
      </div>
    )
  }
}

/**
 * Renders a user favorite location,
 * and lets the user edit the details (name, address, type) of the location.
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

      this._handleChange({ location: newLocation })
    } else {
      arrayHelpers.remove(index)
    }
  }

  _handleChange = ({ location }) => {
    const { arrayHelpers, index, location: oldLocation } = this.props

    arrayHelpers.replace(index, {
      address: location.name,
      icon: oldLocation.icon,
      lat: location.lat,
      lon: location.lon,
      name: location.name, // Was 'My place'
      type: oldLocation.type
    })
  }

  _handleNew = ({ location }) => {
    const { arrayHelpers } = this.props

    // Set, then unset the location state to reset the LocationField after address is entered.
    // (both this.setState calls should trigger componentDidUpdate on LocationField).
    this.setState({ newLocation: location })

    arrayHelpers.push({
      address: location.name,
      icon: 'map-marker',
      lat: location.lat,
      lon: location.lon,
      name: location.name, // Was 'My place'
      type: 'custom'
    })

    this.setState({ newLocation: null })
  }

  render () {
    const { isFixed, isNew } = this.props

    // When true, newLocation makes the control add a new location instead of editing an existing one.
    // The appearance is also different to differentiate the control with others.
    let icon
    let iconTitle
    let handler
    // Don't display a delete button if the item is fixed and its address is blank,
    // or for the new location row.
    let hideDelete
    let location
    let placeholder
    let InputAddon
    if (isNew) {
      location = this.state.newLocation
      icon = 'plus'
      iconTitle = null
      handler = this._handleNew
      hideDelete = true
      placeholder = 'Add another place'
      InputAddon = NewLocationAddon
    } else {
      location = this.props.location
      icon = location.icon
      iconTitle = location.type
      handler = this._handleChange
      hideDelete = isFixed && isBlank(location.address)
      placeholder = isFixed ? `Add ${location.type}` : 'Enter a favorite address'
      InputAddon = StyledAddon
    }

    return (
      <FormGroup>
        <InputGroup>
          <InputAddon title={iconTitle}>
            <FontAwesome name={icon} />
          </InputAddon>
          <StyledLocationField
            inputPlaceholder={placeholder}
            location={location}
            locationType='to'
            onLocationSelected={handler}
            showClearButton={false}
          />
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

export default FavoriteLocationsPane
