import { injectIntl, IntlShape } from 'react-intl'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../util/contexts'
import { getFormattedMode } from '../../util/i18n'
import Icon from '../util/icon'

import { buttonCss } from './batch-styled'

// TS TODO: merge this type with FullModeOption from
// @opentripplanner/trip-form/types.ts and move to @opentripplanner/types.
export type Mode = {
  defaultUnselected?: boolean
  icon?: string
  label?: string
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
  intl,
  item,
  onClick,
  selected
}: {
  className: string
  intl: IntlShape
  item: Mode
  onClick: (mode: string) => void
  selected: boolean
}): JSX.Element => {
  // FIXME: add types to context
  // @ts-expect-error No type on ComponentContext
  const { ModeIcon } = useContext(ComponentContext)
  const { icon, label, mode } = item
  const overlayTooltip = (
    <Tooltip id={mode}>{label || getFormattedMode(mode, intl)}</Tooltip>
  )
  return (
    <OverlayTrigger overlay={overlayTooltip} placement="bottom">
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
  intl,
  modeOptions,
  onClick,
  selectedModes = []
}: {
  className: string
  intl: IntlShape
  modeOptions: Mode[]
  onClick: (mode: string) => void
  selectedModes: string[]
}): JSX.Element => {
  return (
    <>
      {modeOptions.map((item) => (
        <StyledModeButton
          className={className}
          intl={intl}
          item={item}
          key={item.mode}
          onClick={onClick}
          selected={selectedModes.indexOf(item.mode) !== -1}
        />
      ))}
    </>
  )
}

// These mode options are used when they are not provided in the config.
export const defaultModeOptions: Mode[] = [
  {
    mode: 'TRANSIT'
  },
  {
    mode: 'WALK'
  },
  {
    mode: 'CAR'
  },
  {
    mode: 'BICYCLE'
  },
  {
    icon: 'mobile',
    mode: 'RENT' // TODO: include HAIL?
  }
]

export default injectIntl(ModeButtons)
