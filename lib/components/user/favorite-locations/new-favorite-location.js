import React, { Component } from 'react'
import {
  FormGroup,
  InputGroup
} from 'react-bootstrap'

import Icon from '../../narrative/icon'
import {
  FavoriteLocationField,
  FIELD_HEIGHT_PX,
  FixedLocationType,
  InvisibleAddon,
  LocationWrapper,
  makeFavoriteLocation
} from './favorite-location-controls'

const blankNewLocationState = {
  newLocation: null
}

/**
 * Component that lets the user pick a new favorite location.
 */
class NewFavoriteLocation extends Component {
  constructor () {
    super()
    this.state = blankNewLocationState
  }

  _handleNew = ({ location }) => {
    const { arrayHelpers } = this.props

    arrayHelpers.push(makeFavoriteLocation(location, 'custom', 'map-marker'))

    // Unset the location state to reset the LocationField after address is entered.
    // FIXME is there a better way?
    this.setState(blankNewLocationState)
  }

  render () {
    const { newLocation } = this.state
    return (
      <FormGroup>
        <InputGroup>
          <FixedLocationType>
            <Icon fixedWidth={false} name='plus' size='2x' />
          </FixedLocationType>

          <LocationWrapper
            // Center location field vertically.
            style={{lineHeight: FIELD_HEIGHT_PX}}
          >
            <FavoriteLocationField
              inputPlaceholder={'Add another place'}
              location={newLocation}
              locationType='to'
              onLocationSelected={this._handleNew}
              showClearButton={false}
            />
          </LocationWrapper>
          <InvisibleAddon />
        </InputGroup>
      </FormGroup>
    )
  }
}

export default NewFavoriteLocation
