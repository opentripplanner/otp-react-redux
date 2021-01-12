import clone from 'clone'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

import Icon from '../../narrative/icon'

export const FIELD_HEIGHT_PX = '60px'
export const ICON_WIDTH_PX = '30px'

const Container = styled.div`
  align-items: stretch;
  display: flex;
  height: ${FIELD_HEIGHT_PX};
  margin-bottom: 10px;
`

const LocationButton = styled(Button)`
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  width: inherit;
  & > * {
    vertical-align: middle;
  }
`

const StyledIcon = styled(Icon)`
    color: #888;
`

const LocationContent = styled.span`
  display: inline-block;
  margin-left: 10px;

  & * {
    color: #888;
    display: block;
  }

  & *:first-child {
    color: inherit;
  }
`
const DeleteButton = styled(Button)`
  margin-left: 4px;
  width: ${FIELD_HEIGHT_PX};
`

const MESSAGES = {
  EDIT: 'Edit this place',
  DELETE: 'Delete this place'
}

/**
 * Renders a clickable button for editing a user's favorite place,
 * and lets the user delete the place.
 */
class FavoriteLocation extends Component {
  _handleDelete = () => {
    const { arrayHelpers, index, isFixed, location } = this.props
    if (isFixed) {
      // Just clear the address if location is fixed.
      const newLocation = clone(location)
      newLocation.address = null
      arrayHelpers.replace(index, newLocation)
    } else {
      arrayHelpers.remove(index)
    }
  }

  render () {
    const { location } = this.props

    return (
      <Container>
        <LocationButton
          aria-label={MESSAGES.EDIT}
          title={MESSAGES.EDIT}
        >
          <StyledIcon name={location.icon} size='2x' />
          <LocationContent>
            {location.name && <span>{location.name}</span>}
            <span>{location.address || `Set your ${location.type} address`}</span>
          </LocationContent>
        </LocationButton>
        <DeleteButton
          aria-label={MESSAGES.DELETE}
          onClick={this._handleDelete}
          title={MESSAGES.DELETE}
        >
          <StyledIcon name='trash-o' size='2x' />
        </DeleteButton>
      </Container>
    )
  }
}

export default FavoriteLocation
