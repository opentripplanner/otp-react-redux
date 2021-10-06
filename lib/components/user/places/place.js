import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

// import { LinkContainerWithQuery } from '../../form/connected-links'
import NarrativeIcon from '../../narrative/icon'
// import { getPlaceBasePath } from '../../../util/user'

const Container = styled.li`
  align-items: stretch;
  display: flex;
`
export const PlaceButton = styled(Button)`
  background: none;
  border: none;
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
`

export const Icon = styled(NarrativeIcon)``

export const PlaceDetail = styled.span``

export const PlaceContent = styled.span``

export const PlaceName = styled.span`
  text-transform: capitalize;
`

export const PlaceText = styled.span`
  text-transform: capitalize;
`

export const ActionButton = styled(Button)`
  background: none;
  border: none;
  height: 100%;
`

export const ActionButtonPlaceholder = styled.span``

// FIXME_QBD: move this text elsewhere.
const VIEW_LABEL = 'View stop' // used for stops only.
const DELETE_LABEL = 'Delete place'
// const EDIT_LABEL = 'Edit this place'

/**
 * Renders a stylable clickable button for editing/selecting a user's favorite place,
 * and buttons for viewing and deleting the place if corresponding handlers are provided.
 */
const Place = ({
  ariaLabel,
  className,
  detailText,
  icon,
  mainText,
  onClick,
  onDelete,
  onView,
  title
}) => {
  return (
    <Container className={className}>
      <PlaceButton
        aria-label={ariaLabel}
        onClick={onClick}
        title={title}
      >
        <PlaceContent>
          <PlaceText className='place-text'>
            <Icon name={icon} />
            <PlaceName>{mainText}</PlaceName>
          </PlaceText>
          <PlaceDetail className='place-detail'>
            {detailText}
          </PlaceDetail>
        </PlaceContent>
      </PlaceButton>

      {/* Action buttons. If none, render a placeholder. */}
      {!onView && !onDelete && <ActionButtonPlaceholder />}
      {onView && (
        <ActionButton
          aria-label={VIEW_LABEL}
          onClick={onView}
          title={VIEW_LABEL}
        >
          <Icon name='search' />
        </ActionButton>
      )}
      {onDelete && (
        <ActionButton
          aria-label={DELETE_LABEL}
          onClick={onDelete}
          title={DELETE_LABEL}
        >
          <Icon name='trash-o' />
        </ActionButton>
      )}
    </Container>
  )
}

Place.propTypes = {
  /** The aria-label for the main button */
  ariaLabel: PropTypes.string,
  /** The detail text displayed for the place */
  detailText: PropTypes.string,
  /** The font-awesome icon name for the place. */
  icon: PropTypes.string,
  /** The displayed name for the place. */
  mainText: PropTypes.string,
  /** Called when the "main" button is clicked. Takes precedence over the path prop. */
  onClick: PropTypes.func,
  /** Determines whether the Delete button is shown. Called when the Delete button is clicked. */
  onDelete: PropTypes.func,
  /** Determines whether the View button is shown. Called when the View button is clicked. */
  onView: PropTypes.func,
  /** The title for the main button */
  title: PropTypes.string
}

export default Place
