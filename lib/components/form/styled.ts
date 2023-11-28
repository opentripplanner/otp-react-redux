import {
  DateTimeSelector,
  SettingsSelectorPanel,
  Styled as TripFormClasses
} from '@opentripplanner/trip-form'
import { Input, MenuItemLi } from '@opentripplanner/location-field/lib/styled'
import LocationField from '@opentripplanner/location-field'
import styled, { css } from 'styled-components'

const commonButtonCss = css`
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  background: none;
  border: 1px solid rgb(187, 187, 187);
  border-radius: 3px;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  outline-offset: -2px;
  padding: 6px 12px;
  text-align: center;
  touch-action: manipulation;
  user-select: none;

  &.active {
    background-color: var(--main-base-color, rgb(173, 216, 230));
    border: 2px solid rgb(0, 0, 0);
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    color: var(--main-color, white);
    font-weight: 600;
  }
`

export const commonInputCss = css`
  background: none;
  border: 1px solid #ccc;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  color: #555;
  font-family: inherit;
  font-weight: inherit;
  padding: 6px 12px;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
`

export const modeButtonButtonCss = css`
  ${TripFormClasses.ModeButton.Button} {
    ${commonButtonCss}
  }
`

export const Dot = styled.div`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #f00;
`

export const StyledSettingsSelectorPanel = styled(SettingsSelectorPanel)`
  ${modeButtonButtonCss}

  ${TripFormClasses.SettingLabel} {
    color: #686868;
    font-size: 14px;
    font-weight: inherit;
    letter-spacing: 1px;
    padding-top: 8px;
    text-transform: uppercase;
  }
  ${TripFormClasses.SettingsHeader} {
    color: #333333;
    font-size: 18px;
    margin: 16px 0px;
  }
  ${TripFormClasses.SettingsSection} {
    margin-bottom: 16px;
  }
  ${TripFormClasses.DropdownSelector} {
    select {
      ${commonInputCss}
      -webkit-appearance: none;
      border-radius: 3px;
      font-size: 14px;
      height: 34px;
      line-height: 1.42857;
      margin-bottom: 20px;

      &:focus {
        border-color: #66afe9;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
          0 0 8px rgba(102, 175, 233, 0.6);
        outline: 0;
      }
    }
    > div:last-child::after {
      box-sizing: border-box;
      color: #000;
      content: '▼';
      font-size: 67%;
      pointer-events: none;
      position: absolute;
      right: 8px;
      top: 10px;
    }
  }

  ${TripFormClasses.ModeSelector} {
    font-weight: 300;
    ${TripFormClasses.ModeButton.Button} {
      box-shadow: none;
      outline: none;
      padding: 3px;
    }
    ${TripFormClasses.ModeButton.Title} {
      font-size: 10px;
      line-height: 12px;
      padding: 4px 0px 0px;

      &.active {
        font-weight: 600;
      }
    }
  }
  ${TripFormClasses.ModeSelector.MainRow} {
    box-sizing: border-box;
    font-size: 170%;
    margin: 0px -10px 18px;
    padding: 0px 5px;
    ${TripFormClasses.ModeButton.Button} {
      height: 54px;
      width: 100%;
      &.active {
        font-weight: 600;
      }
    }
  }
  ${TripFormClasses.ModeSelector.SecondaryRow} {
    margin: 0px -10px 10px;
    ${TripFormClasses.ModeButton.Button} {
      font-size: 130%;
      font-weight: 800;
      height: 46px;
      > svg {
        margin: 0 0.2em;
      }
    }
  }
  ${TripFormClasses.ModeSelector.TertiaryRow} {
    font-size: 80%;
    font-weight: 300;
    margin: 0px -10px 10px;
    text-align: center;
    ${TripFormClasses.ModeButton.Button} {
      height: 36px;
    }
  }
  ${TripFormClasses.SubmodeSelector.Row} {
    font-size: 12px;
    > * {
      padding: 3px 5px 3px 0px;
    }
    > :last-child {
      padding-right: 0px;
    }
    ${TripFormClasses.ModeButton.Button} {
      height: 35px;
    }
    svg,
    img {
      margin-left: 0px;
    }
  }
  ${TripFormClasses.SubmodeSelector} {
    ${TripFormClasses.SettingLabel} {
      margin-bottom: 0;
    }
  }
  ${TripFormClasses.SubmodeSelector.InlineRow} {
    margin: -3px 0px;
    svg,
    img {
      height: 18px;
      max-width: 32px;
    }
  }
`

export const StyledDateTimeSelector = styled(DateTimeSelector)`
  margin: 0 -15px 15px;

  ${TripFormClasses.DateTimeSelector.DateTimeRow} {
    margin: 20px 0px 15px;
    input {
      ${commonInputCss}
      background-color: #fff;
      border: 0;
      border-bottom: 1px solid #000;
      box-shadow: none;
      outline: none;
      text-align: center;
    }
  }
  ${TripFormClasses.ModeButton.Button} {
    ${commonButtonCss}
    font-size: 14px;
    height: 35px;
  }
`

export const UnpaddedList = styled.ul`
  padding: 0;
`

export const StyledLocationField = styled(LocationField)`
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  width: 100%;

  ${Input} {
    padding: 6px 12px;
  }

  ${MenuItemLi} {
    &:hover {
      color: inherit;
    }
  }
`
