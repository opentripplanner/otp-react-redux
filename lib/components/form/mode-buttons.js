import React, { useContext } from 'react'

import Icon from '../narrative/icon'
import { ComponentContext } from '../../util/contexts'

export const MODE_OPTIONS = [
  {
    mode: 'TRANSIT',
    label: 'Transit'
  },
  {
    mode: 'WALK',
    label: 'Walking'
  },
  {
    mode: 'CAR',
    label: 'Drive'
  },
  {
    mode: 'BICYCLE',
    label: 'Bicycle'
  },
  {
    icon: 'mobile',
    mode: 'RENT', // TODO: include HAIL?
    label: 'Rental options'
  }
]

const ModeButtons = ({
  className,
  endStyle = {},
  onClick,
  selectedModes = [],
  style = {}
}) => {
  const {ModeIcon} = useContext(ComponentContext)
  return MODE_OPTIONS.map((item, index) => {
    let buttonStyle = style
    // Add end style to button style if rendering the last item.
    if (index === MODE_OPTIONS.length - 1) {
      buttonStyle = {...buttonStyle, ...endStyle}
    }
    const isSelected = selectedModes.indexOf(item.mode) !== -1
    return (
      <button
        className={className}
        key={item.mode}
        onClick={() => onClick(item.mode)}
        // FIXME: add hover dropdown?
        onMouseEnter={undefined}
        onMouseLeave={undefined}
        style={buttonStyle}
        title={item.label}
      >
        {item.icon
          ? <Icon className='fa-2x' type={item.icon} />
          : <ModeIcon height={25} mode={item.mode} />
        }
        {isSelected &&
          <Icon
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              color: 'green'
            }}
            type='check' />
        }
      </button>
    )
  })
}

export default ModeButtons
