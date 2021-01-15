import clone from 'clone'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled, { css } from 'styled-components'

import * as uiActions from '../../../actions/ui'
import Icon from '../../narrative/icon'

const FIELD_HEIGHT_PX = '60px'

const Container = styled.div`
  align-items: stretch;
  display: flex;
  height: ${FIELD_HEIGHT_PX};
  margin-bottom: 10px;
`

const PlaceButton = styled(Button)`
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  width: inherit;
  & > * {
    vertical-align: middle;
  }
`

const GreyIcon = styled(Icon)`
  color: #888;
  margin-right: 10px;
`

const PlaceContent = styled.span`
  display: inline-block;

  & * {
    color: #888;
    display: block;
  }

  & *:first-child {
    color: inherit;
  }
`

const deleteCss = css`
  margin-left: 4px;
  width: ${FIELD_HEIGHT_PX};
`

const DeleteButton = styled(Button)`
  ${deleteCss}
`

const DeletePlaceholder = styled.span`
  ${deleteCss}
`

const MESSAGES = {
  EDIT: 'Edit this place',
  DELETE: 'Delete this place'
}

/**
 * Renders a clickable button for editing a user's favorite place,
 * and lets the user delete the place.
 */
class FavoritePlaceRow extends Component {
  static propTypes = {
    // A Formik arrayHelper object.
    arrayHelpers: PropTypes.shape({
      remove: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired
    }),
    // The index of the place to edit or delete.
    index: PropTypes.number,
    // Whether the place is fixed (e.g. 'Home', 'Work' are fixed.)
    isFixed: PropTypes.bool,
    // The place to render.
    place: PropTypes.shape({
      address: PropTypes.string,
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })
  }

  /**
   * Route to /places/<index> for editing an existing place,
   * or to /places/new for creating a new one.
   */
  _handleClick = () => {
    const { index, place, routeTo } = this.props
    const placeId = place ? index : 'new'
    routeTo(`/places/${placeId}`)
  }

  _handleDelete = () => {
    const { arrayHelpers, index, isFixed, place } = this.props
    if (isFixed) {
      // Just clear the address if place is fixed.
      const newPlace = clone(place)
      newPlace.address = ''
      arrayHelpers.replace(index, newPlace)
    } else {
      arrayHelpers.remove(index)
    }
  }

  render () {
    const { isFixed, place } = this.props

    let contents
    if (place) {
      const { address, icon, name, type } = place
      contents = (
        <>
          <PlaceButton
            aria-label={MESSAGES.EDIT}
            onClick={this._handleClick}
            title={MESSAGES.EDIT}
          >
            <GreyIcon name={icon} size='2x' />
            <PlaceContent>
              {name && <span>{name}</span>}
              <span>{address || `Set your ${type} address`}</span>
            </PlaceContent>
          </PlaceButton>

          {/* For fixed places, show Delete only if an address has been provided. */}
          {(!isFixed || address)
            ? (
              <DeleteButton
                aria-label={MESSAGES.DELETE}
                onClick={this._handleDelete}
                title={MESSAGES.DELETE}
              >
                <GreyIcon name='trash-o' size='2x' />
              </DeleteButton>
            )
            : <DeletePlaceholder />}
        </>
      )
    } else {
      // If no place is passed, render the Add place button instead.
      contents = (
        <>
          <PlaceButton onClick={this._handleClick}>
            <GreyIcon name='plus' size='2x' />
            Add another place
          </PlaceButton>
          <DeletePlaceholder />
        </>
      )
    }

    return <Container>{contents}</Container>
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlaceRow)
