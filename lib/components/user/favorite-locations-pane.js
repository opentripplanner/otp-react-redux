import { FieldArray } from 'formik'
import React from 'react'
import { ControlLabel } from 'react-bootstrap'

import { isHomeOrWork } from '../util/user'
import FavoriteLocation from './favorite-location'
import FixedFavoriteLocation from './fixed-favorite-location'
import NewFavoriteLocation from './new-favorite-location'

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 */
const FavoriteLocationsPane = ({ values: userData }) => {
  const { savedLocations } = userData

  return (
    <div>
      <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

      <FieldArray
        name='savedLocations'
        render={arrayHelpers => (
          <>
            {savedLocations.map((loc, index) => {
              const FavoriteLocationComponent = isHomeOrWork(loc)
                ? FixedFavoriteLocation
                : FavoriteLocation
              return (
                <FavoriteLocationComponent
                  arrayHelpers={arrayHelpers}
                  index={index}
                  key={index}
                  location={loc}
                />
              )
            })}

            {/* For adding a location. */}
            <NewFavoriteLocation arrayHelpers={arrayHelpers} />
          </>
        )}
      />
    </div>
  )
}

export default FavoriteLocationsPane
