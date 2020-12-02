import { Field, FieldArray } from 'formik'
import memoize from 'lodash.memoize'
import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  Input as LocationFieldInput,
  InputGroup as LocationFieldInputGroup
} from '@opentripplanner/location-field/lib/styled'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  InputGroup
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

import { getShowUserSettings } from '../../util/state'

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
    display: block;
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

/**
 * User's saved locations editor.
 * TODO: Discuss and improve handling of location details (type, coordinates...).
 */
class FavoriteLocationsPane extends Component {
  constructor () {
    super()
    this.state = {
      location: null
    }
  }

  _handleAddNewLocation = memoize(
    arrayHelpers => ({ location }) => {
      // Set, then unset the location state to reset the LocationField after address is entered.
      // (both this.setState calls should trigger componentDidUpdate on LocationField).
      this.setState({ location })

      arrayHelpers.push({
        address: location.name,
        icon: 'map-marker',
        lat: location.lat,
        lon: location.lon,
        name: 'My place',
        type: 'custom'
      })

      this.setState({ location: null })
    }
  )

  render () {
    const {
      currentPosition,
      geocoderConfig,
      nearbyStops,
      sessionSearches,
      showUserSettings,
      stopsIndex,
      values: userData
    } = this.props
    const { location } = this.state

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
                    index={index}
                    isFixed={isHomeOrWork}
                    key={index}
                    location={loc}
                    // Do not memoize this call, as this component's index will change.
                    onDelete={() => arrayHelpers.remove(index)}
                  />
                )
              })}

              {/* For adding a location. */}
              <FormGroup>
                <InputGroup>
                  <NewLocationAddon>
                    <FontAwesome name='plus' />
                  </NewLocationAddon>
                  <StyledLocationField
                    inputPlaceholder='Add another place'
                    location={location}
                    locationType='to'
                    onLocationSelected={this._handleAddNewLocation(arrayHelpers)}
                    showClearButton

                    currentPosition={currentPosition}
                    geocoderConfig={geocoderConfig}
                    nearbyStops={nearbyStops}
                    sessionSearches={sessionSearches}
                    showUserSettings={showUserSettings}
                    stopsIndex={stopsIndex}
                  />

                </InputGroup>
              </FormGroup>
            </>
          )}
        />
      </div>
    )
  }
}

// connect to redux store
// Get a subset of props that ConnectedLocationField would.
const mapStateToProps = (state, ownProps) => {
  const { config, transitIndex } = state.otp
  const { currentPosition, nearbyStops, sessionSearches } = location
  return {
    currentPosition,
    geocoderConfig: config.geocoder,
    nearbyStops,
    sessionSearches,
    showUserSettings: getShowUserSettings(state.otp),
    stopsIndex: transitIndex.stops
  }
}

const mapDispatchToProps = {
}

/**
 * Renders a user favorite location,
 * and lets the user edit the details (name, address, type) of the location.
 */
const FavoriteLocation = ({ index, isFixed, location, onDelete }) => {
  return (
    <FormGroup>
      <InputGroup>
        <StyledAddon title={location.type}>
          <FontAwesome name={location.icon} />
        </StyledAddon>
        <Field as={FormControl}
          name={`savedLocations.${index}.address`}
          placeholder={isFixed ? `Add ${location.type}` : 'Enter a favorite address'}
          // onBlur, onChange, and value are passed automatically.
        />
        {!isFixed && (
          <InputGroup.Button>
            <Button
              aria-label='Delete this location'
              onClick={onDelete}
              title='Delete this location'
            >
              <FontAwesome name='times' />
            </Button>
          </InputGroup.Button>
        )}
      </InputGroup>
    </FormGroup>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoriteLocationsPane)
