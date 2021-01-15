import { FieldArray } from 'formik'
import React, { Component } from 'react'
import { ControlLabel } from 'react-bootstrap'

import { isHomeOrWork } from '../../../util/user'
import FavoritePlaceRow from './favorite-place-row'

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 */
class FavoriteLocationsPane extends Component {
  _handleDelete = (arrayHelpers, place, index) =>
    () => {
      const isFixed = isHomeOrWork(place)
      if (isFixed) {
        // Just clear the address if place is fixed.
        const newPlace = {
          ...place,
          address: ''
        }
        arrayHelpers.replace(index, newPlace)
      } else {
        arrayHelpers.remove(index)
      }
    }

  render () {
    const { values: userData } = this.props
    const { savedLocations } = userData

    return (
      <div>
        <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

        <FieldArray
          name='savedLocations'
          render={arrayHelpers => (
            <>
              {savedLocations.map((place, index) => (
                <FavoritePlaceRow
                  isFixed={isHomeOrWork(place)}
                  key={index}
                  onDelete={this._handleDelete(arrayHelpers, place, index)}
                  path={`/places/${index}`}
                  place={place}
                />
              )
              )}

              {/* For adding a location. */}
              <FavoritePlaceRow path='/places/new' />
            </>
          )}
        />
      </div>
    )
  }
}

export default FavoriteLocationsPane
