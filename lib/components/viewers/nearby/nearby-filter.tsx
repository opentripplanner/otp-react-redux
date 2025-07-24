import { Check2 } from '@styled-icons/bootstrap'
import { Parking } from '@styled-icons/fa-solid'

import { ComponentContext } from '../../../util/contexts'
import { getBaseColor } from '../../util/colors'
import { invisibleCss } from '@opentripplanner/trip-form/lib/MetroModeSelector'
import { NearbyFilterConfig } from '../../../util/config-types'

import React, { useContext } from 'react'
import styled from 'styled-components'

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
  onChange: (arg: any) => void
  value: boolean
}): JSX.Element => {
  // @ts-expect-error component context
  const { ModeIcon, SvgIcon } = useContext(ComponentContext)
  // The icon is either in SvgIcon or ModeIcon so provide both
  const ModeFilterIcon = () => (
    <ModeIcon className="mode-svg" mode={filter.iconName} />
  )
  const FilterIcon = () => (
    <SvgIcon FallbackIcon={ModeFilterIcon} iconName={filter.iconName} />
  )

  return (
    <StyledFilterCheckbox checked={value} htmlFor={filter.cardType}>
      <FilterIcon />
      {value && <Check2 />}
      <input
        checked={value}
        id={filter.cardType}
        onChange={onChange}
        type="checkbox"
      />
    </StyledFilterCheckbox>
  )
}
