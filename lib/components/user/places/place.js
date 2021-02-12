import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

import { LinkContainerWithQuery } from '../../form/connected-links'
import Icon from '../../narrative/icon'

const Container = styled.li`
  align-items: stretch;
  display: flex;
`
export const PlaceButton = styled(Button)`
  background: none;
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
`

export const PlaceIcon = styled(Icon)``

export const PlaceDetail = styled.span``

export const PlaceContent = styled.span``

export const PlaceName = styled.span``

export const PlaceText = styled.span``

const DeleteButton = styled(Button)`
  background: none;
  height: 100%;
  width: 100%;
`

export const DeletePlaceholder = styled.span``

const MESSAGES = {
  DELETE: 'Delete this place',
  EDIT: 'Edit this place'
}

/**
 * Renders a clickable button for editing a user's favorite place,
 * and a button to delete the place.
 */
const Place = ({
  buttonStyle,
  className,
  isFixed,
  largeIcon,
  onClick,
  onDelete,
  path,
  place,
  placeDetailClassName,
  placeTextClassName
}) => {
  if (place) {
    const { address, icon, name, type } = place
    const to = onClick ? null : path
    const ariaLabel = to && MESSAGES.EDIT // What should it be if onClick is defined?

    return (
      <Container className={className}>
        <LinkContainerWithQuery
          // Don't highlight component if 'to' is null.
          activeClassName=''
          onClick={onClick}
          to={to}
        >
          <PlaceButton
            aria-label={ariaLabel}
            bsStyle={buttonStyle}
            title={ariaLabel}
          >

            {largeIcon && <PlaceIcon name={icon} size='2x' />}
            <PlaceContent>
              <PlaceText className={placeTextClassName}>
                {!largeIcon && <PlaceIcon name={icon} />}
                <PlaceName>{name || 'Unnamed place'}</PlaceName>
              </PlaceText>
              <PlaceDetail className={placeDetailClassName}>
                {address || `Set your ${type} address`}
              </PlaceDetail>
            </PlaceContent>
          </PlaceButton>
        </LinkContainerWithQuery>

        {/* For fixed places, show Delete only if an address has been provided. */}
        <DeletePlaceholder>
          {(!isFixed || address) && (
            <DeleteButton
              aria-label={MESSAGES.DELETE}
              bsStyle={buttonStyle}
              onClick={onDelete}
              title={MESSAGES.DELETE}
            >
              <PlaceIcon name='trash-o' size={largeIcon && '2x'} />
            </DeleteButton>
          )}
        </DeletePlaceholder>
      </Container>
    )
  } else {
    // If no place is passed, render the Add place button instead.
    return (
      <Container className={className}>
        <LinkContainerWithQuery to={path}>
          <PlaceButton>
            <PlaceIcon name='plus' size={largeIcon && '2x'} />
            <PlaceContent>
                Add another place
            </PlaceContent>
          </PlaceButton>
        </LinkContainerWithQuery>
        <DeletePlaceholder />
      </Container>
    )
  }
}

Place.propTypes = {
  /** The Bootstrap style to apply to buttons. */
  buttonStyle: PropTypes.string,
  /** Whether the place is shown, even if address is blank (e.g. 'Home', 'Work') */
  isFixed: PropTypes.bool,
  /** Whether to render icons large. */
  largeIcon: PropTypes.bool,
  /** Called when the "main" button is clicked. Takes precedence over the path prop. */
  onClick: PropTypes.func,
  /** Called when the Delete button is clicked. */
  onDelete: PropTypes.func,
  /** The path to navigate to on click. */
  path: PropTypes.string.isRequired,
  /** The place to render. */
  place: PropTypes.shape({
    address: PropTypes.string,
    icon: PropTypes.string.isRequired,
    name: PropTypes.string,
    type: PropTypes.string.isRequired
  }),
  /** CSS class name for the place details. */
  placeDetailClassName: PropTypes.string,
  /** CSS class name for the place name. */
  placeTextClassName: PropTypes.string
}

export default Place
