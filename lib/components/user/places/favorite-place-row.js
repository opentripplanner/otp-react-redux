import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import styled, { css } from 'styled-components'

import { LinkContainerWithQuery } from '../../form/connected-links'
import Icon from '../../util/icon'

const FIELD_HEIGHT_PX = '60px'

const Container = styled.div`
  align-items: stretch;
  display: flex;
  height: ${FIELD_HEIGHT_PX};
  margin-bottom: 10px;
`
const PlaceButton = styled(Button)`
  align-items: center;
  display: flex;
  flex: 1 0 0;
  overflow: hidden;
  text-align: left;
  width: inherit;
`

const GreyIcon = styled(Icon)`
  color: #888;
  margin-right: 10px;
`

const PlaceContent = styled.span`
  display: inline-block;
  :first-letter {
    text-transform: capitalize;
  }

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

/**
 * Renders a clickable button for editing a user's favorite place,
 * and lets the user delete the place.
 */
const FavoritePlaceRow = ({ isFixed, onDelete, path, place }) => {
  const intl = useIntl()
  if (place) {
    const { address, icon, name, type } = place
    const editMessage = intl.formatMessage({id: 'components.FavoritePlaceRow.editThisPlace'})
    const deleteMessage = intl.formatMessage({id: 'components.FavoritePlaceRow.deleteThisPlace'})
    return (
      <Container>
        <LinkContainerWithQuery to={path}>
          <PlaceButton
            aria-label={editMessage}
            title={editMessage}
          >
            <GreyIcon name={icon} size='2x' />
            <PlaceContent>
              {name && <span>{name}</span>}
              <span>
                {address || (
                  <FormattedMessage
                    id='components.FavoritePlaceRow.setAddressForPlaceType'
                    values={
                      type === 'home'
                        ? {placeType: intl.formatMessage({id: 'common.places.home'})}
                        : {placeType: intl.formatMessage({id: 'common.places.work'})}
                    }
                  />
                )}
              </span>
            </PlaceContent>
          </PlaceButton>
        </LinkContainerWithQuery>

        {/* For fixed places, show Delete only if an address has been provided. */}
        {(!isFixed || address)
          ? (
            <DeleteButton
              aria-label={deleteMessage}
              onClick={onDelete}
              title={deleteMessage}
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
            <FormattedMessage id='components.FavoritePlaceRow.addAnotherPlace' />
          </PlaceButton>
        </LinkContainerWithQuery>
        <DeletePlaceholder />
      </Container>
    )
  }
}

FavoritePlaceRow.propTypes = {
  /** Whether the place is fixed (e.g. 'Home', 'Work' are fixed.) */
  isFixed: PropTypes.bool,
  /** Called when the delete button is clicked. */
  onDelete: PropTypes.func,
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

export default FavoritePlaceRow
