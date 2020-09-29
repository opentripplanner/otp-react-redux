import clone from 'clone'
import { Field, FieldArray } from 'formik'
import memoize from 'lodash.memoize'
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
 * Makes a copy of the logged-in user data for the Formik initial state,
 * with the 'home' and 'work' locations at the top of the savedLocations list
 * so they are always shown and shown at the top of the FavoriteLocationsPane.
 * Note: In the returned value, savedLocations is always a valid array.
 */
export function cloneWithHomeAndWorkAsTopLocations (loggedInUser) {
  const clonedUser = clone(loggedInUser)
  const { savedLocations = [] } = clonedUser

  const homeLocation = savedLocations.find(isHome) || {
    address: '',
    icon: 'home',
    type: 'home'
  }
  const workLocation = savedLocations.find(isWork) || {
    address: '',
    icon: 'briefcase',
    type: 'work'
  }
  const reorderedLocations = [
    homeLocation,
    workLocation,
    ...savedLocations.filter(notHomeOrWork)
  ]

  clonedUser.savedLocations = reorderedLocations
  return clonedUser
}

function addNewAddress (arrayHelpers, e) {
  const value = (e.target.value || '').trim()
  if (value.length > 0) {
    arrayHelpers.push({
      address: value,
      icon: 'map-marker',
      type: 'custom'
    })

    // Empty the input box value so the user can enter their next location.
    e.target.value = ''
  }
}

/**
 * User's saved locations editor.
 * TODO: Discuss and improve handling of location details (type, coordinates...).
 */
class FavoriteLocationsPane extends Component {
  _handleNewAddressKeyDown = memoize(
    arrayHelpers => e => {
      if (e.keyCode === 13) {
        // Add new address to user's savedLocations.
        addNewAddress(arrayHelpers, e)

        // Don't submit the form if user presses enter on the input for entering a new location.
        e.preventDefault()
      }
    }
  )

  _handleNewAddressBlur = memoize(
    arrayHelpers => e => {
      addNewAddress(arrayHelpers, e)
    }
  )

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
                  <FormGroup key={index}>
                    <InputGroup>
                      <StyledAddon title={loc.type}>
                        <FontAwesome name={loc.icon} />
                      </StyledAddon>
                      {/* <Field> passes onBlur, onChange, and value automatically. */}
                      <Field as={FormControl}
                        name={`savedLocations.${index}.address`}
                        placeholder={isHomeOrWork ? `Add ${loc.type}` : 'Enter a favorite address'}
                        type='text'
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

              {/* For adding a new location. */}
              <FormGroup>
                <InputGroup>
                  <NewLocationAddon>
                    <FontAwesome name='plus' />
                  </NewLocationAddon>
                  <NewLocationFormControl
                    onBlur={this._handleNewAddressBlur(arrayHelpers)}
                    onKeyDown={this._handleNewAddressKeyDown(arrayHelpers)}
                    placeholder='Add another place'
                    type='text'
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

export default FavoriteLocationsPane
