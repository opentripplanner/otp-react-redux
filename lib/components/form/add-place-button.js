import React from 'react'

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
      <i className='fa fa-plus-circle' />{' '}
      {maxPlacesDefined
        ? 'Maximum intermediate places reached'
        : disabled
          ? 'Define origin/destination to add intermediate places'
          : 'Add place'
      }
    </button>
  )
}

export default AddPlaceButton
