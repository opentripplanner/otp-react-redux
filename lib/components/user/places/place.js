import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

import { LinkContainerWithQuery } from '../../form/connected-links'
import NarrativeIcon from '../../narrative/icon'

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

export const ActionButton = styled(Button)`
  background: none;
  height: 100%;
`

export const ActionButtonPlaceholder = styled.span``

export const EDIT_LABEL = 'Edit this place'
const VIEW_LABEL = 'View stop' // used for stops only.
const DELETE_LABEL = 'Delete place'

/**
 * Renders a clickable button for editing a user's favorite place,
 * and buttons for viewing and deleting the place if corresponding handlers are provided.
 */
const Place = ({
  ariaLabel,
  buttonStyle,
  className,
  largeIcon,
  onClick,
  onDelete,
  onView,
  path,
  placeDetailClassName,
  placeTextClassName,
  title,

  name,
  icon,
  details
}) => {
  const to = onClick ? null : path
  const iconSize = largeIcon && '2x'

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
          title={title}
        >
          {largeIcon && <Icon name={icon} size='2x' />}
          <PlaceContent>
            <PlaceText className={placeTextClassName}>
              {!largeIcon && <Icon name={icon} />}
              <PlaceName>{name}</PlaceName>
            </PlaceText>

            <PlaceDetail className={placeDetailClassName}>
              {details}
            </PlaceDetail>
          </PlaceContent>
        </PlaceButton>
      </LinkContainerWithQuery>

      {/* Action buttons. If none, render a placeholder. */}
      {onView && (
        <ActionButton
          aria-label={VIEW_LABEL}
          bsStyle={buttonStyle}
          onClick={onView}
          title={VIEW_LABEL}
        >
          <Icon name='search' size={iconSize} />
        </ActionButton>
      )}
      {onDelete && (
        <ActionButton
          aria-label={DELETE_LABEL}
          bsStyle={buttonStyle}
          onClick={onDelete}
          title={DELETE_LABEL}
        >
          <Icon name='trash-o' size={iconSize} />
        </ActionButton>
      )}
      {!onView && !onDelete && <ActionButtonPlaceholder />}
    </Container>
  )
}

Place.propTypes = {
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
  /** CSS class name for the place details. */
  placeDetailClassName: PropTypes.string,
  /** CSS class name for the place name. */
  placeTextClassName: PropTypes.string,
  /** The title for the main button */
  title: PropTypes.string//,

  //name,
  //icon,
  //details
  //onView
  //onDelete

}

export default Place
