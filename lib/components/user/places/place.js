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

const ActionButton = styled(Button)`
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
  actions,
  buttonStyle,
  className,
  largeIcon,
  onClick,
  path,
  place,
  placeDetailClassName,
  placeTextClassName
}) => {
  const to = onClick ? null : path
  if (place) {
    const { address, details, icon, name, title, type } = place
    const ariaLabel = title || (to && MESSAGES.EDIT) 
    //What should it be if onClick is defined?

    return (
      <Container className={className}>
        <LinkContainerWithQuery
          // Don't highlight component if 'to' is null.
          activeClassName=''
          to={to}
        >
          <PlaceButton
            aria-label={ariaLabel}
            bsStyle={buttonStyle}
            onClick={onClick}
            title={ariaLabel}
          >

            {largeIcon && <PlaceIcon name={icon} size='2x' />}
            <PlaceContent>
              <PlaceText className={placeTextClassName}>
                {!largeIcon && <PlaceIcon name={icon} />}
                <PlaceName>{name || address}</PlaceName>
              </PlaceText>
              
              <PlaceDetail className={placeDetailClassName}>
                {name && (details || address || `Set your ${type} address`)}
              </PlaceDetail>
              
            </PlaceContent>
          </PlaceButton>
        </LinkContainerWithQuery>

        {/* Action buttons */}
        {actions && actions.map(({ icon: actionIcon, onClick: onAction, title }, index) => (
          <DeletePlaceholder key={index}>
            <ActionButton
              aria-label={title}
              bsStyle={buttonStyle}
              onClick={onAction}
              title={title}
            >
              <PlaceIcon name={actionIcon} size={largeIcon && '2x'} />
            </ActionButton>
          </DeletePlaceholder>
        ))}

      </Container>
    )
  } else {
    // If no place is passed, render the Add place button instead.
    return (
      <Container className={className}>
        <LinkContainerWithQuery to={to}>
          <PlaceButton onClick={onClick}>
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
  /** The action buttons for the place. */
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string,
    onClick: PropTypes.func,
    title: PropTypes.string
  })),
  /** The Bootstrap style to apply to buttons. */
  buttonStyle: PropTypes.string,
  /** Whether to render icons large. */
  largeIcon: PropTypes.bool,
  /** Called when the "main" button is clicked. Takes precedence over the path prop. */
  onClick: PropTypes.func,
  /** The path to navigate to on click. */
  path: PropTypes.string,
  /** The place to render. */
  place: PropTypes.shape({
    address: PropTypes.string,
    details: PropTypes.string,
    icon: PropTypes.string.isRequired,
    name: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string.isRequired
  }),
  /** CSS class name for the place details. */
  placeDetailClassName: PropTypes.string,
  /** CSS class name for the place name. */
  placeTextClassName: PropTypes.string
}

export default Place
