import React, { Component } from 'react'
import {
  ControlLabel,
  FormGroup,
  InputGroup
} from 'react-bootstrap'
import styled from 'styled-components'

import Icon from '../narrative/icon'
import {
  FavoriteLocationField,
  FixedLocationType,
  InvisibleAddon,
  LocationNameWrapper,
  LocationWrapper,
  makeFavoriteLocation,
  makeLocationFieldLocation
} from './favorite-location-controls'

// Styles for other controls
const FixedLocationName = styled(ControlLabel)`
  display: block;
  margin: 0;
  padding: 4px 0;
`

/**
 * Renders a user fixed favorite location, where only the address can be edited.
 */
class FixedFavoriteLocation extends Component {
  _handleLocationChange = ({ location }) => {
    const { arrayHelpers, index, location: oldLocation } = this.props
    const { icon, name, type } = oldLocation
    arrayHelpers.replace(index, makeFavoriteLocation(location, type, icon, name))
  }

  render () {
    const { location } = this.props
    const { icon, type } = location

    return (
      <FormGroup>
        <InputGroup>
          <FixedLocationType title={type}>
            <Icon fixedWidth={false} name={icon} size='2x' />
          </FixedLocationType>

          <LocationWrapper>
            <LocationNameWrapper>
              <FixedLocationName>
                {location.name}
              </FixedLocationName>
            </LocationNameWrapper>
            <FavoriteLocationField
              inputPlaceholder={`Add ${type}`}
              location={makeLocationFieldLocation(location)}
              locationType='to'
              onLocationSelected={this._handleLocationChange}
              showClearButton={false}
            />
          </LocationWrapper>

          <InvisibleAddon />
        </InputGroup>
      </FormGroup>
    )
  }
}

export default FixedFavoriteLocation
