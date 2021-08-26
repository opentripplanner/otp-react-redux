import React from 'react'
import { FormattedMessage } from 'react-intl'

import IconWithSpace from '../util/icon-with-space'

const AddPlaceButton = ({from, intermediatePlaces, onClick, to}) => {
  // Only permit adding intermediate place if from/to is defined.
  const maxPlacesDefined = intermediatePlaces.length >= 3
  const disabled = !from || !to || maxPlacesDefined
  return (
    <button
      className='clear-button-formatting'
      disabled={disabled}
      onClick={onClick}
      style={{marginBottom: '5px', marginLeft: '10px'}}
    >
      <IconWithSpace type='plus-circle' />
      {maxPlacesDefined
        ? <FormattedMessage id='components.AddPlaceButton.tooManyPlaces' />
        : disabled
          ? <FormattedMessage id='components.AddPlaceButton.needOriginDestination' />
          : <FormattedMessage id='components.AddPlaceButton.addPlace' />
      }
    </button>
  )
}

export default AddPlaceButton
