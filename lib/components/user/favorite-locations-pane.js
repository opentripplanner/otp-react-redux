import clone from 'clone'
import { FieldArray } from 'formik'
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

/**
 * User's saved locations editor.
 * TODO: Discuss and improve handling of location details (type, coordinates...).
 */
class FavoriteLocationsPane extends Component {
  render () {
    const { handleBlur, handleChange, values: userData } = this.props
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
              {savedLocations.map((loc, index) => (
                <FormGroup key={index}>
                  <InputGroup>
                    <StyledAddon title={loc.type}>
                      <FontAwesome name={loc.icon} />
                    </StyledAddon>
                    <FormControl
                      name={`savedLocations.${index}.address`}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder={`Add ${loc.type}`}
                      type='text'
                      value={loc.address}
                    />
                    {loc !== homeLocation && loc !== workLocation && (
                      <InputGroup.Button>
                        <Button aria-label='Delete this location' onClick={() => {
                          arrayHelpers.remove(index)
                        }} title='Delete this location'>
                          <FontAwesome name='times' />
                        </Button>
                      </InputGroup.Button>
                    )}
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
                    onBlur={e => {
                      const value = (e.target.value || '').trim()
                      if (value.length > 0) {
                        arrayHelpers.push({
                          address: value,
                          icon: 'map-marker',
                          type: 'custom'
                        })

                        // Event onChange will trigger after this and before rerender,
                        // so DO empty the input box value so the user can enter their next location.
                        e.target.value = ''
                      }
                    }}
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
