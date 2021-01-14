import clone from 'clone'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled, { css } from 'styled-components'

import * as uiActions from '../../../actions/ui'
import Icon from '../../narrative/icon'

export const FIELD_HEIGHT_PX = '60px'
export const ICON_WIDTH_PX = '30px'

const Container = styled.div`
  align-items: stretch;
  display: flex;
  height: ${FIELD_HEIGHT_PX};
  margin-bottom: 10px;
`

const LocationButton = styled(Button)`
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  width: inherit;
  & > * {
    vertical-align: middle;
  }
`

const StyledIcon = styled(Icon)`
  color: #888;
  margin-right: 10px;
`

const LocationContent = styled.span`
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
  // TODO: add prop types.

  /**
   * Route to /places/<index> for editing an existing place,
   * or to /places/new for creating a new one.
   */
  _handleClick = () => {
    const { index, location, routeTo } = this.props
    const placeId = location ? index : 'new'
    routeTo(`/places/${placeId}`)
  }

  _handleDelete = () => {
    const { arrayHelpers, index, isFixed, location } = this.props
    if (isFixed) {
      // Just clear the address if location is fixed.
      const newLocation = clone(location)
      newLocation.address = ''
      arrayHelpers.replace(index, newLocation)
    } else {
      arrayHelpers.remove(index)
    }
  }

  render () {
    const { isFixed, location } = this.props

    let contents
    if (location) {
      contents = (
        <>
          <LocationButton
            aria-label={MESSAGES.EDIT}
            onClick={this._handleClick}
            title={MESSAGES.EDIT}
          >
            <StyledIcon name={location.icon} size='2x' />
            <LocationContent>
              {location.name && <span>{location.name}</span>}
              <span>{location.address || `Set your ${location.type} address`}</span>
            </LocationContent>
          </LocationButton>

          {/* For fixed locations, show Delete only if an address has been provided. */}
          {(!isFixed || location.address)
            ? (
              <DeleteButton
                aria-label={MESSAGES.DELETE}
                onClick={this._handleDelete}
                title={MESSAGES.DELETE}
              >
                <StyledIcon name='trash-o' size='2x' />
              </DeleteButton>
            )
            : <DeletePlaceholder />}
        </>
      )
    } else {
      // If no location is passed, render the Add place button instead.
      contents = (
        <>
          <LocationButton onClick={this._handleClick}>
            <StyledIcon name='plus' size='2x' />
            Add another place
          </LocationButton>
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
