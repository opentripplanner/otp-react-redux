import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

import { LinkContainerWithQuery } from '../../form/connected-links'
import NarrativeIcon from '../../narrative/icon'
import { isHomeOrWork } from '../../../util/user'

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

export const Icon = styled(NarrativeIcon)``

export const PlaceDetail = styled.span``

export const PlaceContent = styled.span``

export const PlaceName = styled.span``

export const PlaceText = styled.span``

const ActionButton = styled(Button)`
  background: none;
  height: 100%;
  width: 100%;
`

export const ActionButtonContainer = styled.span``

export const EDIT_LABEL = 'Edit this place'

/**
 * Obtains the actions (e.g. delete, view) for the given place and handlers:
 * - All places can be deleted, except Home and Work with empty addresses.
 * - Only 'stop' locations can be 'viewed'.
 */
export function getActionsForPlace (place, onDelete, onView) {
  if (!place) return []

  const deleteAction = {
    icon: 'trash-o',
    onClick: onDelete,
    title: 'Delete place'
  }
  const viewAction = {
    icon: 'search',
    onClick: onView,
    title: 'View stop'
  }

  const actions = []

  const isFixed = isHomeOrWork(place)
  if (onView && place.type === 'stop') {
    actions.push(viewAction)
  }
  if (onDelete && (!isFixed || place.address)) {
    actions.push(deleteAction)
  }

  return actions
}

/**
 * Renders a clickable button for editing a user's favorite place,
 * and buttons for the provided actions (e.g. view, delete).
 */
const Place = ({
  actions,
  ariaLabel,
  buttonStyle,
  className,
  largeIcon,
  onClick,
  path,
  place,
  placeDetailClassName,
  placeTextClassName,
  title
}) => {
  const to = onClick ? null : path
  const iconSize = largeIcon && '2x'
  let placeButton
  if (place) {
    const { address, details, icon, name, type } = place
    placeButton = (
      <PlaceButton
        aria-label={ariaLabel}
        bsStyle={buttonStyle}
        onClick={onClick}
        title={title}
      >

        {largeIcon && <Icon name={icon} size='2x' />}
        <PlaceContent>
          <PlaceText className={placeTextClassName}>
            {!largeIcon && <Icon name={icon} />}
            <PlaceName>{name || address}</PlaceName>
          </PlaceText>

          <PlaceDetail className={placeDetailClassName}>
            {name && (details || address || `Set your ${type} address`)}
          </PlaceDetail>
        </PlaceContent>
      </PlaceButton>
    )
  } else {
    placeButton = (
      <PlaceButton onClick={onClick}>
        <Icon name='plus' size={iconSize} />
        <PlaceContent>
          Add another place
        </PlaceContent>
      </PlaceButton>
    )
  }

  return (
    <Container className={className}>
      <LinkContainerWithQuery
        // Don't highlight component if 'to' is null.
        activeClassName=''
        to={to}
      >
        {placeButton}
      </LinkContainerWithQuery>

      {/* Action buttons. If none, render a placeholder. */}
      {actions && actions.length
        ? actions.map(({ icon: actionIcon, onClick: onAction, title: actionTitle }, index) => (
          <ActionButtonContainer key={index}>
            <ActionButton
              aria-label={actionTitle}
              bsStyle={buttonStyle}
              onClick={onAction}
              title={actionTitle}
            >
              <Icon name={actionIcon} size={iconSize} />
            </ActionButton>
          </ActionButtonContainer>
        ))
        : <ActionButtonContainer />
      }
    </Container>
  )
}

Place.propTypes = {
  /** The action buttons for the place. */
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string,
    onClick: PropTypes.func,
    title: PropTypes.string
  })),
  /** The aria-label for the main button */
  ariaLabel: PropTypes.string,
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
    type: PropTypes.string
  }),
  /** CSS class name for the place details. */
  placeDetailClassName: PropTypes.string,
  /** CSS class name for the place name. */
  placeTextClassName: PropTypes.string,
  /** The title for the main button */
  title: PropTypes.string
}

export default Place
