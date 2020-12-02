import { Field, FieldArray } from 'formik'
import memoize from 'lodash.memoize'
import LocationField from '@opentripplanner/location-field'
import {
  DropdownContainer,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  MenuItemA
} from '@opentripplanner/location-field/lib/styled'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup as BsFormGroup,
  InputGroup as BsInputGroup
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

import { getShowUserSettings } from '../../util/state'

// Styles.
const fancyAddLocationCss = `
  background-color: #337ab7;
  color: #fff;
`
const StyledAddon = styled(BsInputGroup.Addon)`
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

  ${InputGroup} {
    border: none;
    display: block;
  }
  ${Input} {
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
                  <BsFormGroup key={index}>
                    <BsInputGroup>
                      <StyledAddon title={loc.type}>
                        <FontAwesome name={loc.icon} />
                      </StyledAddon>
                      <Field as={FormControl}
                        name={`savedLocations.${index}.address`}
                        placeholder={isHomeOrWork ? `Add ${loc.type}` : 'Enter a favorite address'}
                        // onBlur, onChange, and value are passed automatically.
                      />
                      {!isHomeOrWork && (
                        <BsInputGroup.Button>
                          <Button
                            aria-label='Delete this location'
                            // Do not memoize this call, as this component's index will change.
                            onClick={() => arrayHelpers.remove(index)}
                            title='Delete this location'
                          >
                            <FontAwesome name='times' />
                          </Button>
                        </BsInputGroup.Button>
                      )}
                    </BsInputGroup>
                  </BsFormGroup>
                )
              })}

              {/* For adding a location. */}
              <BsFormGroup>
                <BsInputGroup>
                  <NewLocationAddon>
                    <FontAwesome name='plus' />
                  </NewLocationAddon>
                  <StyledLocationField
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

                </BsInputGroup>
              </BsFormGroup>
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
