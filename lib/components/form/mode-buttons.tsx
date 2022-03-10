import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../util/contexts'
import Icon from '../util/icon'

import { buttonCss } from './batch-styled'

export type Mode = {
  icon?: string
  label: string
  mode: string
}

const CheckMarkIcon = styled(Icon)`
  position: absolute;
  bottom: 2px;
  right: 2px;
  color: green;
`

const ModeButton = ({
  className,
  item,
  onClick,
  selected
}: {
  className: string
  item: Mode
  onClick: (mode: string) => void
  selected: boolean
}): JSX.Element => {
  // FIXME: type context
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { ModeIcon } = useContext(ComponentContext)
  const { icon, label, mode } = item
  return (
    <OverlayTrigger
      overlay={<Tooltip id={mode}>{label}</Tooltip>}
      placement="bottom"
    >
      <button className={className} onClick={() => onClick(mode)}>
        {icon ? (
          <Icon className="fa-2x" type={icon} />
        ) : (
          <ModeIcon height={25} mode={mode} />
        )}
        {selected && <CheckMarkIcon type="check" />}
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

const ModeButtons = ({
  className,
  modeOptions,
  onClick,
  selectedModes = []
}: {
  className: string
  modeOptions: Mode[]
  onClick: (mode: string) => void
  selectedModes: string[]
}): JSX.Element => {
  return (
    <>
      {modeOptions.map((item) => (
        <StyledModeButton
          className={className}
          item={item}
          key={item.mode}
          onClick={onClick}
          selected={selectedModes.indexOf(item.mode) !== -1}
        />
      ))}
    </>
  )
}

export default ModeButtons
