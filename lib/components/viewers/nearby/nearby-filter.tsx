import { Check2 } from '@styled-icons/bootstrap/Check2'
import { useIntl } from 'react-intl'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import { getBaseColor } from '../../util/colors'
import { invisibleCss } from '../../util/invisible-a11y-label'
import { NearbyFilterConfig } from '../../../util/config-types'

const FILTER_LABELS = {
  BikeRentalStation: 'components.nearbyView.bikeRentalStation',
  RentalVehicle: 'common.modes.rent',
  Stop: 'components.MapLayers.stops',
  VehicleParking: 'common.modes.car_park'
}

const StyledFilterCheckbox = styled.label<{ checked: boolean }>`
  width: 75px;
  height: 35px;
  border-radius: 10px;
  background: ${(props) => (props.checked ? '#fff' : '#ffffffd9')};
  box-shadow: 0px 0px 5px 1px inset rgb(0 0 0 / 0.05);
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: center;
  margin: 0;
  justify-content: space-between;
  padding: 0.5em;
  align-content: center;
  justify-items: center;
  transition: all ease 150ms;

  svg {
    width: 25px;
    height: 25px;
    color: ${getBaseColor()};

    &:first-of-type {
      grid-column: 1;
    }
  }

  input {
    ${invisibleCss}
    position: absolute;
  }
  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    cursor: pointer;
    background: ${(props) => (props.checked ? '#fff' : '#ffffffe5')};
    transition: all ease 150ms;
  }
`

export const FilterCheckboxes = ({
  filter,
  onChange,
  value
}: {
  filter: NearbyFilterConfig
  onChange: (arg: React.ChangeEvent<HTMLInputElement>) => void
  value: boolean
}): JSX.Element => {
  const intl = useIntl()
  // @ts-expect-error component context
  const { ModeIcon, SvgIcon } = useContext(ComponentContext)
  // The icon is either in SvgIcon or ModeIcon so provide both
  const ModeFilterIcon = () => (
    <ModeIcon className="mode-svg" mode={filter.iconName} />
  )
  const filterLabel = intl.formatMessage({ id: FILTER_LABELS[filter.cardType] })

  return (
    <StyledFilterCheckbox
      checked={value}
      htmlFor={filter.cardType}
      title={filterLabel}
    >
      <SvgIcon Fallback={ModeFilterIcon} iconName={filter.iconName} />
      {value && <Check2 />}
      <input
        aria-label={filterLabel}
        checked={value}
        id={filter.cardType}
        onChange={onChange}
        type="checkbox"
      />
    </StyledFilterCheckbox>
  )
}
