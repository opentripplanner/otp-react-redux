import * as TripFormClasses from '@opentripplanner/trip-form/lib/styled'
import { SettingsSelectorPanel } from '@opentripplanner/trip-form'
import styled, { css } from 'styled-components'

import { commonInputCss, modeButtonButtonCss } from './styled'
import DateTimePreview from './date-time-preview'

const SHADOW = 'inset 0px 0px 5px #c1c1c1'

const activeCss = css`
  background: #e5e5e5;
  -webkit-box-shadow: ${SHADOW};
  -moz-box-shadow: ${SHADOW};
  box-shadow: ${SHADOW};
  outline: none;
`

export const buttonCss = css`
  height: 45px;
  width: 45px;
  margin: 0px;
  border: 0px;
  border-radius: 5px;
  &:active {
    ${activeCss}
  }
`

export const Button = styled.button`
  ${buttonCss}
`

export const StyledDateTimePreview = styled(DateTimePreview)`
  ${buttonCss}
  background-color: rgb(239, 239, 239);
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  padding: 7px 5px;
  text-align: left;
  white-space: nowrap;
  width: 120px;
  ${(props) => (props.expanded ? activeCss : null)}
`
export const SettingsPreview = styled(Button)<{ expanded?: boolean }>`
  line-height: 22px;
  margin-right: 5px;
  padding: 10px 0px;
  position: relative;
  ${(props) => (props.expanded ? activeCss : null)}
`

export const PlanTripButton = styled(Button)`
  background-color: green;
  color: #ffffffdd;
  margin-left: auto;
  padding: 5px;
  &:active {
    ${activeCss}
    filter: saturate(50%);
    background: green;
  }

  span.fa {
    margin-left: -2.5px; /* without HiDPI things still look fine, just a little off center */
  }
`

const expandableBoxCss = css`
  background-color: rgb(239, 239, 239);
  box-shadow: rgba(0, 0, 0, 0.32) 7px 12px 10px;
  border-radius: 5px 5px 5px 5px;
  left: 10px;
  position: absolute;
  right: 10px;
  z-index: 99999;
`

export const DateTimeModalContainer = styled.div`
  ${expandableBoxCss}
  padding: 10px 20px;
`

export const BatchPreferencesContainer = styled.div`
  ${expandableBoxCss}
  padding: 5px 10px;
`

export const MainSettingsRow = styled.div`
  align-items: top;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: 5px;
`

// FIXME: This is identical to StyledSettingsSelectorPanel, with a
// couple of items set to display: none (SettingsHeader and ModeSelector)
export const StyledBatchPreferences = styled(SettingsSelectorPanel)`
  ${modeButtonButtonCss}

  ${TripFormClasses.SettingLabel} {
    color: #686868;
    font-size: 14px;
    font-weight: 100;
    letter-spacing: 1px;
    padding-top: 8px;
    text-transform: uppercase;
  }
  ${TripFormClasses.SettingsHeader} {
    display: none;
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
    display: none;
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
