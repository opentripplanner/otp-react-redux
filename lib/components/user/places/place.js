import { Button } from 'react-bootstrap'
import { Search } from '@styled-icons/fa-solid/Search'
import { TrashAlt } from '@styled-icons/fa-solid/TrashAlt'
import { useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import { LinkContainerWithQuery } from '../../form/connected-links'
import { StyledIconWrapper } from '../../util/styledIcon'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

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

export const IconWrapper = styled(StyledIconWrapper)``

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
  const { SvgIcon } = useContext(ComponentContext)
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
          {largeIcon && (
            <IconWrapper size="2x">
              <SvgIcon iconName={icon} />
            </IconWrapper>
          )}
          <PlaceContent>
            <PlaceText className="place-text">
              {!largeIcon && (
                <IconWrapper>
                  <SvgIcon iconName={icon} />
                </IconWrapper>
              )}
              <PlaceName>{mainText}</PlaceName>
            </PlaceText>
            <InvisibleA11yLabel> - </InvisibleA11yLabel>
            <PlaceDetail className="place-detail">{detailText}</PlaceDetail>
          </PlaceContent>
        </PlaceButton>
      </LinkContainerWithQuery>

      {/* Action buttons. If none, render a placeholder. */}
      {!onView && !onDelete && <ActionButtonPlaceholder />}
      {onView && (
        // This button is only used for viewing stops.
        <ActionButton onClick={onView} title={viewStopLabel}>
          <IconWrapper size={iconSize}>
            <Search />
          </IconWrapper>
          <InvisibleA11yLabel>{viewStopLabel}</InvisibleA11yLabel>
        </ActionButton>
      )}
      {onDelete && (
        <ActionButton onClick={onDelete} title={deletePlaceLabel}>
          <IconWrapper size={iconSize}>
            <TrashAlt />
          </IconWrapper>
          <InvisibleA11yLabel>{deletePlaceLabel}</InvisibleA11yLabel>
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
