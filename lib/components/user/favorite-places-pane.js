import PropTypes from 'prop-types'
import React from 'react'
import {
  ControlLabel,
  FormControl,
  FormGroup,
  InputGroup
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

const fancyAddLocationCss = `
  background-color: #337ab7;
  color: #fff;
`
const StyledAddon = styled(InputGroup.Addon)`
  min-width: 40px;
`
const NewPlaceAddon = styled(StyledAddon)`
  ${fancyAddLocationCss}
`
const NewPlaceFormControl = styled(FormControl)`
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

const FavoriteLocationsPane = ({ onAddPlace, onEditPlaceAddress, places }) => (
  <div>
    <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

    {places.map((place, index) => (
      <FormGroup key={index}>
        <InputGroup>
          <StyledAddon title={place.type}>
            <FontAwesome name={place.icon} />
          </StyledAddon>
          <FormControl
            onChange={e => onEditPlaceAddress(place, e)}
            placeholder={`Add ${place.type}`}
            type='text'
            value={place.address} />
        </InputGroup>
      </FormGroup>
    ))}

    {/* For adding a location. */}
    <FormGroup>
      <InputGroup>
        <NewPlaceAddon>
          <FontAwesome name='plus' />
        </NewPlaceAddon>
        <NewPlaceFormControl
          onBlur={onAddPlace}
          placeholder='Add another place'
          type='text'
        />
      </InputGroup>
    </FormGroup>
  </div>
)

FavoriteLocationsPane.propTypes = {
  /** Triggered when user adds a new place (clicks away from new place editor or presses enter.) */
  onAddPlace: PropTypes.func.isRequired,

  /** Triggered when the address field for an item in places changes. */
  onEditPlaceAddress: PropTypes.func.isRequired,

  /** The list of places to edit. */
  places: PropTypes.arrayOf(PropTypes.shape({
    address: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  })).isRequired
}

export default FavoriteLocationsPane
