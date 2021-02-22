import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as userActions from '../../../actions/user'
import Place, {
  ActionButton,
  ActionButtonPlaceholder,
  EDIT_LABEL,
  getActionsForPlace,
  PlaceButton,
  PlaceContent,
  PlaceDetail,
  Icon
} from './place'

const FIELD_HEIGHT_PX = '60px'

const StyledPlace = styled(Place)`
  align-items: stretch;
  display: flex;
  height: ${FIELD_HEIGHT_PX};
  margin-bottom: 10px;

  ${PlaceButton} {
    align-items: center;
    display: flex;
    flex: 1 0 0;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
  }
  ${PlaceContent} {
    display: inline-block;
    margin-left: 10px;
  }
  ${PlaceDetail} {
    color: #888;
    display: block;
  }
  ${Icon} {
    color: #888;
    flex-shrink: 0;
  }
  ${ActionButton}, ${ActionButtonPlaceholder} {
    margin-left: 4px;
    width: ${FIELD_HEIGHT_PX};
  }
`

/**
 * Wrapper for the Place component in FavoritePlaceList that
 * handles deleting the place.
 */
class FavoritePlace extends Component {
  _handleDelete = () => {
    const { deleteUserPlace, place } = this.props
    deleteUserPlace(place.id)
  }

  render () {
    const { path, place } = this.props
    const label = place && EDIT_LABEL

    return (
      <StyledPlace
        actions={getActionsForPlace(place, this._handleDelete)}
        ariaLabel={label}
        largeIcon
        path={path}
        place={place}
        title={label}
      />
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  deleteUserPlace: userActions.deleteUserPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlace)
