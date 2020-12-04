import { FieldArray } from 'formik'
import React from 'react'
import { ControlLabel } from 'react-bootstrap'

import FavoriteLocation, { isHome, isWork } from './favorite-location'

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 */
const FavoriteLocationsPane = ({ values: userData }) => {
  const { savedLocations } = userData
  const homeLocation = savedLocations.find(isHome)
  const workLocation = savedLocations.find(isWork)

  return (
    <div>
      <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

      <FieldArray
        name='savedLocations'
        render={arrayHelpers => (
          <>
            {savedLocations.map((loc, index) => {
              const isHomeOrWork = loc === homeLocation || loc === workLocation
              return (
                <FavoriteLocation
                  arrayHelpers={arrayHelpers}
                  index={index}
                  isFixed={isHomeOrWork}
                  key={index}
                  location={loc}
                />
              )
            })}

            {/* For adding a location. */}
            <FavoriteLocation
              arrayHelpers={arrayHelpers}
              isNew
            />
          </>
        )}
      />
    </div>
  )
}

export default FavoriteLocationsPane
