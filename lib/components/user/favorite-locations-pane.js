import { FieldArray } from 'formik'
import React from 'react'
import { ControlLabel } from 'react-bootstrap'

import FavoriteLocation from './favorite-location'
import NewFavoriteLocation from './new-favorite-location'

// Defaults for home and work
export const BLANK_HOME = {
  address: '',
  icon: 'home',
  name: 'Home',
  type: 'home'
}
export const BLANK_WORK = {
  address: '',
  icon: 'briefcase',
  name: 'Work',
  type: 'work'
}

const placeholders = {
  home: BLANK_HOME,
  work: BLANK_WORK
}

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
            {savedLocations.map((loc, index) => (
              <FavoriteLocation
                arrayHelpers={arrayHelpers}
                index={index}
                key={index}
                location={loc}
                placeholder={placeholders[loc.type]}
              />
            ))}

            {/* For adding a location. */}
            <NewFavoriteLocation arrayHelpers={arrayHelpers} />
          </>
        )}
      />
    </div>
  )
}

export default FavoriteLocationsPane
