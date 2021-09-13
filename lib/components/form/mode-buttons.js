import React, { useContext } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import styled from 'styled-components'

import { ComponentContext } from '../../util/contexts'
import Icon from '../util/icon'

import {buttonCss} from './batch-styled'

function getModeOptions (intl) {
  // intl.formatMessage is used here instead of <FormattedMessage> because the text is
  // rendered inside <OverlayTrigger>, which renders outside of the <IntlProvider> context.
  return [
    {
      label: intl.formatMessage({id: 'components.ModeButtons.transit'}),
      mode: 'TRANSIT'
    },
    {
      label: intl.formatMessage({id: 'components.ModeButtons.walk'}),
      mode: 'WALK'
    },
    {
      label: intl.formatMessage({id: 'components.ModeButtons.car'}),
      mode: 'CAR'
    },
    {
      label: intl.formatMessage({id: 'components.ModeButtons.bicycle'}),
      mode: 'BICYCLE'
    },
    {
      icon: 'mobile',
      label: intl.formatMessage({id: 'components.ModeButtons.rent'}),
      mode: 'RENT' // TODO: include HAIL?
    }
  ]
}

const ModeButtons = ({
  className,
  onClick,
  selectedModes = []
}) => {
  const intl = useIntl()
  return getModeOptions(intl).map((item, index) => (
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
