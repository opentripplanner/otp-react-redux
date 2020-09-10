import { Field, FieldArray } from 'formik'
import memoize from 'lodash.memoize'
import LocationField from '@opentripplanner/location-field'
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

// Helper filter functions.
export const isHome = loc => loc.type === 'home'
export const isWork = loc => loc.type === 'work'

/**
 * User's saved locations editor.
 * TODO: Discuss and improve handling of location details (type, coordinates...).
 */
class FavoriteLocationsPane extends Component {
  _handleAddNewLocation = memoize(
    arrayHelpers => ({ location }) => {
      arrayHelpers.push({
        address: location.name,
        icon: 'map-marker',
        lat: location.lat,
        lon: location.lon,
        name: 'My place',
        type: 'custom'
      })
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
                  <FormGroup key={index}>
                    <InputGroup>
                      <StyledAddon title={loc.type}>
                        <FontAwesome name={loc.icon} />
                      </StyledAddon>
                      <Field as={FormControl}
                        name={`savedLocations.${index}.address`}
                        placeholder={isHomeOrWork ? `Add ${loc.type}` : 'Enter a favorite address'}
                        // onBlur, onChange, and value are passed automatically.
                      />
                      {!isHomeOrWork && (
                        <InputGroup.Button>
                          <Button
                            aria-label='Delete this location'
                            // Do not memoize this call, as this component's index will change.
                            onClick={() => arrayHelpers.remove(index)}
                            title='Delete this location'
                          >
                            <FontAwesome name='times' />
                          </Button>
                        </InputGroup.Button>
                      )}
                    </InputGroup>
                  </FormGroup>
                )
              })}

              {/* For adding a location. */}
              <FormGroup>
                <InputGroup>
                  <NewLocationAddon>
                    <FontAwesome name='plus' />
                  </NewLocationAddon>
                  {/*
                  <NewLocationFormControl
                    onBlur={this._handleNewAddressBlur(arrayHelpers)}
                    onKeyDown={this._handleNewAddressKeyDown(arrayHelpers)}
                    placeholder='Add another place'
                    type='text'
                  />
                  */}
                  <LocationField
                    inputPlaceholder='Add another place'
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

export default connect(mapStateToProps, mapDispatchToProps)(FavoriteLocationsPane)
