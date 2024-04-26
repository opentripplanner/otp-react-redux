import { Button } from 'react-bootstrap'
import { Search } from '@styled-icons/fa-solid/Search'
import { TrashAlt } from '@styled-icons/fa-solid/TrashAlt'
import { useIntl } from 'react-intl'
import React, { HTMLAttributes, ReactNode, useContext } from 'react'
import styled, { css } from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import { StyledIconWrapper } from '../../util/styledIcon'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import Link from '../../util/link'

interface Props extends HTMLAttributes<HTMLLIElement> {
  /** The action text shown for accessibility purposes */
  actionText?: string
  /** The detail content displayed for the place */
  detailText?: ReactNode
  /** The font-awesome icon name for the place. */
  icon?: string
  /** Whether to render icons large. */
  largeIcon?: boolean
  /** The displayed content for the place. */
  mainText?: ReactNode
  /** Called when the "main" button is clicked. Takes precedence over the path prop. */
  onClick?: () => void
  /** Determines whether the Delete button is shown. Called when the Delete button is clicked. */
  onDelete?: () => void
  /** Determines whether the View button is shown. Called when the View button is clicked. */
  onView?: () => void
  /** The path to navigate to on click. */
  path?: string
  /** The HTML tag to render to. */
  tag?: string
  /** The title for the main button */
  title?: string
}
/*
interface ConfigContext extends Context {
  SvgIcon: ComponentType<{ iconName?: string }>
}
*/
const Container = styled.li`
  align-items: stretch;
  display: flex;
`

// Definitions below are for customizable subcomponents referenced in
// styled.js to define multiple flavors of the Place component,
// without creating circular references between that file and this file.

const placeButtonCss = css`
  background: none;
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
`

export const PlaceButton = styled(Button)`
  ${placeButtonCss}
`

export const PlaceLink = styled(Link)`
  ${placeButtonCss}
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
  actionText,
  className,
  detailText,
  icon,
  largeIcon,
  mainText,
  onClick,
  onDelete,
  onView,
  path,
  tag = 'li',
  title = `${mainText}${detailText && ` (${detailText})`}`
}: Props): JSX.Element => {
  const intl = useIntl()
  // @ts-expect-error TODO: Add types to ComponentContext
  const { SvgIcon } = useContext(ComponentContext)
  const viewStopLabel = intl.formatMessage({ id: 'components.Place.viewStop' })
  const deletePlaceLabel = intl.formatMessage({
    id: 'components.Place.deleteThisPlace'
  })
  const iconSize = largeIcon ? '2x' : undefined

  const placeContent = (
    <>
      {largeIcon && (
        <IconWrapper size="2x">
          <SvgIcon iconName={icon} />
        </IconWrapper>
      )}
      <PlaceContent title={title}>
        <PlaceText className="place-text">
          {!largeIcon && (
            <IconWrapper>
              <SvgIcon iconName={icon} />
            </IconWrapper>
          )}
          <PlaceName>{mainText}</PlaceName>
        </PlaceText>
        {detailText && (
          <PlaceDetail className="place-detail">
            <InvisibleA11yLabel> - </InvisibleA11yLabel>
            {detailText}
          </PlaceDetail>
        )}
        {actionText && <InvisibleA11yLabel> [{actionText}]</InvisibleA11yLabel>}
      </PlaceContent>
    </>
  )

  return (
    // @ts-expect-error Prop 'as' from styled-components is not recognized by TypeScript.
    <Container as={tag} className={className}>
      {onClick ? (
        <PlaceButton onClick={onClick}>{placeContent}</PlaceButton>
      ) : (
        <PlaceLink className="btn btn-default" to={path}>
          {placeContent}
        </PlaceLink>
      )}

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

export default Place
