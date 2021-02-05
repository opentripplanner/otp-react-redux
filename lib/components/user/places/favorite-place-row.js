import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-bootstrap'
import styled, { css } from 'styled-components'

import { LinkContainerWithQuery } from '../../form/connected-links'
import Icon from '../../narrative/icon'

const FIELD_HEIGHT_PX = '60px'

const Container = styled.div`
  align-items: stretch;
  display: flex;
  height: ${FIELD_HEIGHT_PX};
  margin-bottom: 10px;
`
const PlaceButton = styled(Button)`
  align-items: center;
  display: flex;
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  width: inherit;
`

const GreyIcon = styled(Icon)`
  color: #888;
  margin-right: 10px;
`

const PlaceContent = styled.span`
  display: inline-block;

  & * {
    color: #888;
    display: block;
  }

  & *:first-child {
    color: inherit;
  }
`

const deleteCss = css`
  margin-left: 4px;
  width: ${FIELD_HEIGHT_PX};
`

const DeleteButton = styled(Button)`
  ${deleteCss}
`

const DeletePlaceholder = styled.span`
  ${deleteCss}
`

const MESSAGES = {
  EDIT: 'Edit this place',
  DELETE: 'Delete this place'
}

/**
 * Renders a clickable button for editing a user's favorite place,
 * and lets the user delete the place.
 */
const FavoritePlaceRow = ({ isFixed, onDelete, path, place }) => {
  if (place) {
    const { address, icon, name, type } = place
    return (
      <Container>
        <LinkContainerWithQuery to={path}>
          <PlaceButton
            aria-label={MESSAGES.EDIT}
            title={MESSAGES.EDIT}
          >
            <GreyIcon name={icon} size='2x' />
            <PlaceContent>
              {name && <span>{name}</span>}
              <span>{address || `Set your ${type} address`}</span>
            </PlaceContent>
          </PlaceButton>
        </LinkContainerWithQuery>

        {/* For fixed places, show Delete only if an address has been provided. */}
        {(!isFixed || address)
          ? (
            <DeleteButton
              aria-label={MESSAGES.DELETE}
              onClick={onDelete}
              title={MESSAGES.DELETE}
            >
              <GreyIcon name='trash-o' size='2x' />
            </DeleteButton>
          )
          : <DeletePlaceholder />}
      </Container>
    )
  } else {
    // If no place is passed, render the Add place button instead.
    return (
      <Container>
        <LinkContainerWithQuery to={path}>
          <PlaceButton>
            <GreyIcon name='plus' size='2x' />
              Add another place
          </PlaceButton>
        </LinkContainerWithQuery>
        <DeletePlaceholder />
      </Container>
    )
  }
}

FavoritePlaceRow.propTypes = {
  /** Whether the place is fixed (e.g. 'Home', 'Work' are fixed.) */
  isFixed: PropTypes.bool,
  /** Called when the delete button is clicked. */
  onDelete: PropTypes.func,
  /** The path to navigate to on click. */
  path: PropTypes.string.isRequired,
  /** The place to render. */
  place: PropTypes.shape({
    address: PropTypes.string,
    icon: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  })
}

export default FavoritePlaceRow
