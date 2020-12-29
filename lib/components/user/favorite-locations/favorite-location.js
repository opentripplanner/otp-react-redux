import React, { Component } from 'react'
import {
  Button,
  FormControl,
  FormGroup,
  Glyphicon,
  InputGroup
} from 'react-bootstrap'
import styled from 'styled-components'

import {
  FavoriteLocationField,
  FavoriteLocationTypeDropdown,
  FIELD_HEIGHT_PX,
  LocationNameWrapper,
  LocationWrapper,
  makeFavoriteLocation,
  makeLocationFieldLocation
} from './favorite-location-controls'

// Styles for other controls
const LocationNameInput = styled(FormControl)`
  border: none;
  border-bottom: 1px solid #eee;
  box-shadow: none;
  font-weight: bold;
  height: inherit;
  padding: 4px 0;
  width: 100%;
`
const DeleteWrapper = styled(InputGroup.Button)`
  height: ${FIELD_HEIGHT_PX};
  & > button {
    border-left: none;
    height: 100%;
  }
`

/**
 * Renders a user favorite location,
 * and lets the user edit the details (address, type, nickname) of the location.
 */
class FavoriteLocation extends Component {
  _handleDelete = () => {
    const { arrayHelpers, index } = this.props
    arrayHelpers.remove(index)
  }

  _handleLocationChange = ({ location }) => {
    const { arrayHelpers, index, location: oldLocation } = this.props
    const { icon, name, type } = oldLocation
    arrayHelpers.replace(index, makeFavoriteLocation(location, type, icon, name))
  }

  _handleLocationNameChange = e => {
    const { arrayHelpers, index, location } = this.props
    const newLocation = {
      ...location,
      name: e.target.value
    }
    arrayHelpers.replace(index, newLocation)
  }

  _handleLocationTypeChange = ({ icon, type }) => {
    const { arrayHelpers, index, location } = this.props
    const newLocation = {
      ...location,
      icon,
      type
    }
    arrayHelpers.replace(index, newLocation)
  }

  render () {
    const { index, location } = this.props

    return (
      <FormGroup>
        <InputGroup>
          <FavoriteLocationTypeDropdown
            id={`icon-select-${index}`}
            onChange={this._handleLocationTypeChange}
            selectedType={location.type}
          />

          <LocationWrapper>
            <LocationNameWrapper>
              <LocationNameInput
                onChange={this._handleLocationNameChange}
                placeholder='Enter a nickname for this location'
                value={location.name}
              />
            </LocationNameWrapper>
            <FavoriteLocationField
              inputPlaceholder='Enter a favorite address'
              location={makeLocationFieldLocation(location)}
              locationType='to'
              onLocationSelected={this._handleLocationChange}
              showClearButton={false}
            />
          </LocationWrapper>

          <DeleteWrapper>
            <Button
              aria-label='Delete this location'
              onClick={this._handleDelete}
              title='Delete this location'
            >
              <Glyphicon glyph='trash' />
            </Button>
          </DeleteWrapper>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default FavoriteLocation
