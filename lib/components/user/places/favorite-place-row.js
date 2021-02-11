import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled, { css } from 'styled-components'

import * as userActions from '../../../actions/user'
import { LinkContainerWithQuery } from '../../form/connected-links'
import Icon from '../../narrative/icon'

const FIELD_HEIGHT_PX = '60px'

const Container = styled.div`
  align-items: stretch;
  display: flex;
  height: ${FIELD_HEIGHT_PX};
  margin-bottom: 10px;
`
const PlaceButton = styled(Button)`
  align-items: center;
  background: none;
  display: flex;
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  width: inherit;
`

const GreyIcon = styled(Icon)`
  color: #888;
  flex-shrink: 0;
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
  background: none;
`

const DeletePlaceholder = styled.span`
  ${deleteCss}
`

const MESSAGES = {
  DELETE: 'Delete this place',
  EDIT: 'Edit this place'
}

/**
 * Renders a clickable button for editing a user's favorite place,
 * and lets the user delete the place.
 */
class FavoritePlaceRow extends Component {
  _handleDelete = () => {
    const { deleteUserPlace, place } = this.props
    deleteUserPlace(place)
  }

  render () {
    const { isFixed, onClick, path, place } = this.props
    if (place) {
      const { address, icon, name, type } = place
      const to = onClick ? null : path
      const ariaLabel = to && MESSAGES.EDIT //What should it be if onClick is defined?

      return (
        <Container>
          <LinkContainerWithQuery
          // Don't highlight component if 'to' is null.
            activeClassName=''
            onClick={onClick}
            to={to}
          >
            <PlaceButton
              aria-label={ariaLabel}
              title={ariaLabel}
            >
              <GreyIcon name={icon} size='2x' />
              <PlaceContent>
                {name && <span>{name}</span>}
                <span>{address || `Set your ${type} address`}</span>
              </PlaceContent>
            </PlaceButton>
          </LinkContainerWithQuery>

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
        </Container>
      )
    } else {
    // If no place is passed, render the Add place button instead.
      return (
        <Container>
          <LinkContainerWithQuery to={path}>
            <PlaceButton>
              <GreyIcon name='plus' size='2x' />
              Add another place
            </PlaceButton>
          </LinkContainerWithQuery>
          <DeletePlaceholder />
        </Container>
      )
    }
  }
}

FavoritePlaceRow.propTypes = {
  /** Whether the place is shown, even if address is blank (e.g. 'Home', 'Work') */
  isFixed: PropTypes.bool,
  /** Called when the "main" button is clicked. Takes precedence over the path prop. */
  onClick: PropTypes.func,
  /** The path to navigate to on click. */
  path: PropTypes.string.isRequired,
  /** The place to render. */
  place: PropTypes.shape({
    address: PropTypes.string,
    icon: PropTypes.string.isRequired,
    name: PropTypes.string,
    type: PropTypes.string.isRequired
  })
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  deleteUserPlace: userActions.deleteUserPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlaceRow)
