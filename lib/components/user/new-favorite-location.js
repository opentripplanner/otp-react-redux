import React, { Component } from 'react'
import {
  DropdownButton,
  FormGroup,
  InputGroup
} from 'react-bootstrap'
import styled from 'styled-components'

import { makeFavoriteLocation } from './favorite-location'
import { FavoriteLocationField, FavoriteLocationTypeDropdown } from './favorite-location-controls'

// Styles
const NewLocationDropdownButton = styled(DropdownButton)`
  background-color: #337ab7;
  color: #fff;
  width: 40px;
`

const blankNewLocationState = {
  newLocation: null,
  newLocationType: 'custom'
}

/**
 * Renders a user favorite location,
 * and lets the user edit the details (address, type, TODO: nickname) of the location.
 */
class NewFavoriteLocation extends Component {
  constructor () {
    super()
    this.state = blankNewLocationState
  }

  _handleLocationTypeChange = ({ icon, type }) => {
    // Update location type in dropdown.
    this.setState({ newLocationType: type })
  }

  _handleNew = ({ location }) => {
    const { arrayHelpers } = this.props
    const { newLocationType } = this.state

    arrayHelpers.push(makeFavoriteLocation(location, newLocationType, 'map-marker'))

    // Unset the location state to reset the LocationField after address is entered.
    this.setState(blankNewLocationState)
  }

  render () {
    const { newLocation, newLocationType } = this.state
    return (
      <FormGroup>
        <InputGroup>
          <FavoriteLocationTypeDropdown
            DropdownButtonComponent={NewLocationDropdownButton}
            id={`icon-select-new`}
            onChange={this._handleLocationTypeChange}
            selectedType={newLocationType}
          />

          {/* wrapper with z-index override needed for showing location menu on top of other controls. TODO: refactor. */}
          <span className='form-control' style={{ padding: 0, zIndex: 'inherit' }}>
            <FavoriteLocationField
              inputPlaceholder={'Add another place'}
              location={newLocation}
              locationType='to'
              onLocationSelected={this._handleNew}
              showClearButton={false}
            />
          </span>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default NewFavoriteLocation
