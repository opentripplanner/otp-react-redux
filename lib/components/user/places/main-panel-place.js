import React, { Component } from 'react'
import styled from 'styled-components'

import { isHomeOrWork } from '../../../util/user'
import Place, { DeletePlaceholder, PlaceDetail, PlaceName } from './place'

const StyledPlace = styled(Place)`
  ${PlaceName} {
    margin-left: 0.25em;
  }
  ${PlaceDetail} {
    display: block;
    height: 100%;
  }
  ${DeletePlaceholder} {
    width: 40px;
  }
`

/**
 * Wrapper for the Place component in the main panel that
 * handles deleting the place.
 */
class MainPanelPlace extends Component {
  render () {
    const { onClick, onDelete, onView, path, place } = this.props
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
    if (place.type === 'stop') actions.push(viewAction)
    if (!isFixed || place.address) actions.push(deleteAction)

    return (
      <StyledPlace
        actions={actions}
        buttonStyle='link'
        className='place-item'
        onClick={onClick}
        path={path}
        place={place}
        placeDetailClassName='place-detail'
        placeTextClassName='place-text'
      />
    )
  }
}

export default MainPanelPlace
