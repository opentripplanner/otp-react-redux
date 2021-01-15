import React, { useContext } from 'react'
import styled from 'styled-components'

import Icon from '../narrative/icon'
import { ComponentContext } from '../../util/contexts'
import {buttonCss} from '../app/styled'

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
  onClick,
  selectedModes = []
}) => {
  return MODE_OPTIONS.map((item, index) => (
    <StyledModeButton
      className={className}
      key={item.mode}
      onClick={onClick}
      selected={selectedModes.indexOf(item.mode) !== -1}
      item={item}
    />
  ))
}

const CheckMarkIcon = styled(Icon)`
  position: absolute;
  bottom: 2px;
  right: 2px;
  color: green;
`

const ModeButton = ({className, item, onClick, selected}) => {
  const {ModeIcon} = useContext(ComponentContext)
  return (
    <button
      className={className}
      onClick={() => onClick(item.mode)}
      // FIXME: add hover dropdown?
      title={item.label}
    >
      {item.icon
        ? <Icon className='fa-2x' type={item.icon} />
        : <ModeIcon height={25} mode={item.mode} />
      }
      {selected && <CheckMarkIcon type='check' />}
    </button>
  )
}

export const StyledModeButton = styled(ModeButton)`
  ${buttonCss}
  &.flex {
    flex-grow: 1;
    margin-right: 5px;
  }
  &.straight-corners {
    border-radius: 0px;
  }
  border: 0px;
  position: relative;
`

export default ModeButtons
