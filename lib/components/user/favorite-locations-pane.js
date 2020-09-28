import { Field, FieldArray } from 'formik'
import clone from 'clone'
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
 * User's saved locations editor.
 * TODO: Discuss and improve handling of location details (type, coordinates...).
 */
class FavoriteLocationsPane extends Component {
  render () {
    const { handleBlur, handleChange, values: userData } = this.props
    // FIXME: remove assigning [] when null.
    const { savedLocations = [] } = userData

    // Build an 'effective' list of locations for display,
    // where at least one 'home' and one 'work', are always present even if blank.
    // In theory there could be multiple home or work locations.
    // Just pick the first one.
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

    const effectiveLocations = [
      homeLocation,
      workLocation,
      ...savedLocations.filter(notHomeOrWork)
    ]

    return (
      <div>
        <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

        <FieldArray
          name='savedLocations'
          render={arrayHelpers => {
            // If a home or work locations do not exist,
            // add them to the Formik state so they are shown by default.
            // This will also cause them to be saved in the database (without causing side-effects).
            // Home is at position 0, work at 1.
            let homeExists = savedLocations.find(isHome)
            if (!homeExists) {
              arrayHelpers.insert(0, {
                address: '',
                icon: 'home',
                type: 'home'
              })
              homeExists = true
            }
            if (!savedLocations.find(isWork)) {
              arrayHelpers.insert(homeExists ? 1 : 0, {
                address: '',
                icon: 'briefcase',
                type: 'work'
              })
            }

            // TODO: move home and work to the top of the list if they exist.

            return (
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
                          }} title='Delete'>
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
            )
          }}
        />
      </div>
    )
  }
}

export default FavoriteLocationsPane
