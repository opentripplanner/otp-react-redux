import { Button, Panel } from 'react-bootstrap'
import { Edit } from '@styled-icons/fa-solid/Edit'
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
const Container = styled.li`
  list-style: none;
`

// Definitions below are for customizable subcomponents referenced in
// styled.js to define multiple flavors of the Place component,
// without creating circular references between that file and this file.

const placeCss = css`
  background: none;
  text-align: left;
  width: 100%;
`

export const PlaceButton = styled(Button)`
  ${placeCss}
`

export const PlaceContainer = styled(Panel.Body)`
  display: grid;
  align-items: center;
  gap: 15px;
  grid-template-columns: 30px auto 30px;
  ${placeCss}
`

export const PlaceDetail = styled.span`
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

export const PlaceContent = styled.span``

export const PlaceName = styled.span``

export const PlaceText = styled.span``

export const IconWrapper = styled(StyledIconWrapper)`
  justify-self: center;
  grid-column: 1;
`

export const ActionButton = styled(Button)`
  background: none;
  height: 100%;
`

export const ActionButtonPlaceholder = styled.span``

const SavedPlacePanel = styled(Panel)`
  margin-bottom: 10px;

  .panel-body:before,
  .panel-body:after {
    display: none !important;
  }
`

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
  path,
  tag = 'li',
  title = `${mainText}${detailText && ` (${detailText})`}`
}: Props): JSX.Element => {
  const intl = useIntl()
  // @ts-expect-error TODO: Add types to ComponentContext
  const { SvgIcon } = useContext(ComponentContext)
  const placeContent = (
    <>
      {largeIcon && (
        <IconWrapper size="1.5x">
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
        <SavedPlacePanel style={{ marginBottom: '10px' }}>
          <PlaceContainer>
            {placeContent}
            <Link to={path}>
              <Edit height={18} />
            </Link>
          </PlaceContainer>
        </SavedPlacePanel>
      )}

      {/* Action buttons. If none, render a placeholder. */}
    </Container>
  )
}

export default Place
