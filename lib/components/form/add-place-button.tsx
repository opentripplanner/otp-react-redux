import { FormattedMessage } from 'react-intl'
import { PlusCircle } from '@styled-icons/fa-solid/PlusCircle'
import React from 'react'

import { IconWithText } from '../util/styledIcon'

type Props = {
  from: unknown
  intermediatePlaces: Array<unknown>
  onClick: () => void
  to: unknown
}

const AddPlaceButton = ({
  from,
  intermediatePlaces,
  onClick,
  to
}: Props): JSX.Element => {
  // Only permit adding intermediate place if from/to is defined.
  const maxPlacesDefined = intermediatePlaces.length >= 3
  const disabled = !from || !to || maxPlacesDefined
  return (
    <button
      className="clear-button-formatting"
      disabled={disabled}
      onClick={onClick}
      style={{ marginBottom: '5px', marginLeft: '10px' }}
    >
      <IconWithText Icon={PlusCircle}>
        {maxPlacesDefined ? (
          <FormattedMessage id="components.AddPlaceButton.tooManyPlaces" />
        ) : disabled ? (
          <FormattedMessage id="components.AddPlaceButton.needOriginDestination" />
        ) : (
          <FormattedMessage id="components.AddPlaceButton.addPlace" />
        )}
      </IconWithText>
    </button>
  )
}

export default AddPlaceButton
