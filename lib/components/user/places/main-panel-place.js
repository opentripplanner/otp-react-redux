import React from 'react'
import styled from 'styled-components'

import Place, {
  ActionButton,
  EDIT_LABEL,
  getActionsForPlace,
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
 * Wrapper for the Place component in the main panel that
 * handles deleting the place.
 */
const MainPanelPlace = ({
  onClick,
  onDelete,
  onView,
  path,
  place
}) => {
  // Determine title and aria label.
  const isPlanAction = !!onClick
  const planLabel = 'Plan an itinerary using this entry'
  const label = isPlanAction ? planLabel : EDIT_LABEL
  const title = isPlanAction ? `${place.title || place.address}\n${planLabel}` : EDIT_LABEL

  return (
    <StyledPlace
      actions={getActionsForPlace(place, onDelete, onView)}
      ariaLabel={label}
      buttonStyle='link'
      className='place-item'
      onClick={onClick}
      path={path}
      place={place}
      placeDetailClassName='place-detail'
      placeTextClassName='place-text'
      title={title}
    />
  )
}

export default MainPanelPlace
