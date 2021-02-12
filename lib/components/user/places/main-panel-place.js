import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as userActions from '../../../actions/user'

import Place, { DeletePlaceholder, PlaceName } from './place'

const StyledPlace = styled(Place)`
  ${PlaceName} {
    margin-left: 0.25em;
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
  _handleDelete = () => {
    const { deleteUserPlace, place } = this.props
    deleteUserPlace(place)
  }

  render () {
    const { isFixed, onClick, path, place } = this.props
    return (
      <StyledPlace
        buttonStyle='link'
        className='place-item'
        isFixed={isFixed}
        onClick={onClick}
        onDelete={this._handleDelete}
        path={path}
        place={place}
        placeDetailClassName='place-detail'
        placeTextClassName='place-text'
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

export default connect(mapStateToProps, mapDispatchToProps)(MainPanelPlace)
