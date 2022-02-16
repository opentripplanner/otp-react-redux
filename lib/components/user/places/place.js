import { Button } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { LinkContainerWithQuery } from '../../form/connected-links'
import BaseIcon from '../../util/icon'

const Container = styled.li`
  align-items: stretch;
  display: flex;
`

// Definitions below are for customizable subcomponents referenced in
// styled.js to define multiple flavors of the Place component,
// without creating circular references between that file and this file.

export const PlaceButton = styled(Button)`
  background: none;
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
`

export const PlaceDetail = styled.span``

export const PlaceContent = styled.span``

export const PlaceName = styled.span``

export const PlaceText = styled.span``

export const Icon = styled(BaseIcon)``

export const ActionButton = styled(Button)`
  background: none;
  height: 100%;
`

export const ActionButtonPlaceholder = styled.span``

/**
 * Renders a stylable clickable button for editing/selecting a user's favorite place,
 * and buttons for viewing and deleting the place if corresponding handlers are provided.
 */
const Place = ({
  className,
  detailText,
  icon,
  largeIcon,
  mainText,
  onClick,
  onDelete,
  onView,
  path,
  title = `${mainText}${detailText && ` (${detailText})`}`
}) => {
  const intl = useIntl()
  const viewStopLabel = intl.formatMessage({ id: 'components.Place.viewStop' })
  const deletePlaceLabel = intl.formatMessage({
    id: 'components.Place.deleteThisPlace'
  })
  const to = onClick ? null : path
  const iconSize = largeIcon && '2x'
  return (
    <Container className={className}>
      <LinkContainerWithQuery
        // Don't highlight component if 'to' is null.
        activeClassName=""
        to={to}
      >
        <PlaceButton onClick={onClick} title={title}>
          {largeIcon && <Icon size={iconSize} type={icon} />}
          <PlaceContent>
            <PlaceText className="place-text">
              {!largeIcon && <Icon type={icon} />}
              <PlaceName>{mainText}</PlaceName>
            </PlaceText>
            <PlaceDetail className="place-detail">{detailText}</PlaceDetail>
          </PlaceContent>
        </PlaceButton>
      </LinkContainerWithQuery>

      {/* Action buttons. If none, render a placeholder. */}
      {!onView && !onDelete && <ActionButtonPlaceholder />}
      {onView && (
        // This button is only used for viewing stops.
        <ActionButton
          aria-label={viewStopLabel}
          onClick={onView}
          title={viewStopLabel}
        >
          <Icon size={iconSize} type="search" />
        </ActionButton>
      )}
      {onDelete && (
        <ActionButton
          aria-label={deletePlaceLabel}
          onClick={onDelete}
          title={deletePlaceLabel}
        >
          <Icon size={iconSize} type="trash-o" />
        </ActionButton>
      )}
    </Container>
  )
}

Place.propTypes = {
  /** Optional CSS class name */
  className: PropTypes.string,
  /** The detail text displayed for the place */
  detailText: PropTypes.node,
  /** The font-awesome icon name for the place. */
  icon: PropTypes.string,
  /** Whether to render icons large. */
  largeIcon: PropTypes.bool,
  /** The displayed name for the place. */
  mainText: PropTypes.node,
  /** Called when the "main" button is clicked. Takes precedence over the path prop. */
  onClick: PropTypes.func,
  /** Determines whether the Delete button is shown. Called when the Delete button is clicked. */
  onDelete: PropTypes.func,
  /** Determines whether the View button is shown. Called when the View button is clicked. */
  onView: PropTypes.func,
  /** The path to navigate to on click. */
  path: PropTypes.string,
  /** The title for the main button */
  title: PropTypes.string
}

export default Place
