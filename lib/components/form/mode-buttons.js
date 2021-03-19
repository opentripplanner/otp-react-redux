import React, { useContext } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
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
      item={item}
      key={item.mode}
      onClick={onClick}
      selected={selectedModes.indexOf(item.mode) !== -1}
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
  const {icon, label, mode} = item
  return (
    <OverlayTrigger
      overlay={<Tooltip id={mode}>{label}</Tooltip>}
      placement='bottom'
    >
      <button
        className={className}
        onClick={() => onClick(mode)}
      >
        {icon
          ? <Icon className='fa-2x' type={icon} />
          : <ModeIcon height={25} mode={mode} />
        }
        {selected && <CheckMarkIcon type='check' />}
      </button>
    </OverlayTrigger>
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
