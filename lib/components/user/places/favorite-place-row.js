import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as userActions from '../../../actions/user'

import Place, {
  DeletePlaceholder,
  PlaceButton,
  PlaceContent,
  PlaceDetail,
  PlaceIcon
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
  ${PlaceIcon} {
    color: #888;
    flex-shrink: 0;
  }
  ${DeletePlaceholder} {
    margin-left: 4px;
    width: ${FIELD_HEIGHT_PX};
  }
`

/**
 * Wrapper for the Place component in FavoritePlacesList that
 * handles deleting the place.
 */
class FavoritePlaceRow extends Component {
  _handleDelete = () => {
    const { deleteUserPlace, place } = this.props
    deleteUserPlace(place)
  }

  render () {
    const { isFixed, path, place } = this.props
    return (
      <StyledPlace
        isFixed={isFixed}
        largeIcon
        onDelete={this._handleDelete}
        path={path}
        place={place}
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

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlaceRow)
