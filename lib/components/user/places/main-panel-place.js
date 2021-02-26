import React from 'react'
import styled from 'styled-components'

import Place, {
  ActionButton,
  EDIT_LABEL,
  PlaceDetail,
  PlaceName
} from './place'

const StyledPlace = styled(Place)`
  ${PlaceName} {
    margin-left: 0.25em;
  }
  ${PlaceDetail} {
    display: block;
    height: 100%;
  }
  ${ActionButton} {
    width: 40px;
  }
`

/**
 * Wrapper for the Place component in the main panel.
 */
const MainPanelPlace = ({
  details,
  icon,
  name,
  onClick,
  onDelete,
  onView,
  path,
  title
}) => {
  //?? Determine aria label
  const isPlanAction = !!onClick
  const planLabel = 'Plan an itinerary using this entry'
  const label = isPlanAction ? `${title}\n${planLabel}` : EDIT_LABEL

  return (
    <StyledPlace
      ariaLabel={label}
      buttonStyle='link'
      className='place-item'
      details={details}
      icon={icon}
      name={name}
      onClick={onClick}
      onDelete={onDelete}
      onView={onView}
      path={path}
      placeDetailClassName='place-detail'
      placeTextClassName='place-text'
      title={title}
    />
  )
}

export default MainPanelPlace
