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
export const isHome = loc => loc.type === 'home'
export const isWork = loc => loc.type === 'work'

/**
 * Helper function that adds a new address to the Formik state
 * using the Formik-provided arrayHelpers object.
 */
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
