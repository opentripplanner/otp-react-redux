import styled from 'styled-components'
import { SettingsSelectorPanel } from '@opentripplanner/trip-form'
import * as TripFormClasses from '@opentripplanner/trip-form/lib/styled'

// TODO: Extract button CSS properties into their own const.

export const StyledSettingsSelectorPanel = styled(SettingsSelectorPanel)`
  ${TripFormClasses.SettingLabel} {
    font-weight: 400;
    margin-bottom: 0;
  }
  ${TripFormClasses.SettingsHeader} {
    font-size: 18px;
    margin: 16px 0px;    
  }
  ${TripFormClasses.SettingsSection} {
    margin-bottom: 16px;
  }
  ${TripFormClasses.DropdownSelector} {
    margin-bottom:20px;
    select {
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
      color: #555;
      font-size: 14px;
      height: 34px;
      line-height: 1.42857143;
      padding: 6px 12px;
      transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;

      &:focus {
        border-color: #66afe9;
        box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
        outline: 0;
      }
    }
  }

  ${TripFormClasses.ModeSelector} {
    ${TripFormClasses.ModeButton.Button} {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      background: none;
      border: 1px solid rgb(187, 187, 187);
      border-radius: 3px;
      box-shadow: none;
      outline: 0;
      padding: 3px;
      text-align: center;
      user-select: none;

      &.active {
        background-color: rgb(173, 216, 230);
        border: 2px solid rgb(0, 0, 0);
      }
    }
    ${TripFormClasses.ModeButton.Title} {
      font-size: 10px;
      font-weight: 300;
      line-height: 12px;
      padding: 4px 0px 0px;
    }
  }
  ${TripFormClasses.ModeSelector.MainRow} {
    margin: 0 -10px 18px;
    padding: 0 5px;
    
    ${TripFormClasses.ModeButton.Button} {
      font-size: 200%;
      font-weight: 300;
      height: 54px;
      width: 100%;
      &.active {
        font-weight: 600;
      }  
    }
  }
  ${TripFormClasses.ModeSelector.SecondaryRow} {
    margin: 0 -10px 10px;
    ${TripFormClasses.ModeButton.Button} {
      font-size: 150%;
      font-weight: 600;
      height: 46px;
    }
  }
  ${TripFormClasses.ModeSelector.TertiaryRow} {
    margin: 0 -10px 10px;
    ${TripFormClasses.ModeButton.Button}
    {
      font-size: 90%;
      height: 36px;
    }
  }

  ${TripFormClasses.SubmodeSelector.Row} {
    > * {
      padding: 3px 5px 3px 0px;
    }
    > :last-child {
      padding-right: 0px;
    }
    ${TripFormClasses.ModeButton.Button} {
      padding: 6px 12px;
    }
    svg,
    img {
      margin-left: 0px;
    }
  }
  ${TripFormClasses.SubmodeSelector.InlineRow} {
    margin: -3px 0px;
  }

  ${TripFormClasses.SubmodeSelector} {
    ${TripFormClasses.ModeButton.Button} {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      color: #333;
      cursor: pointer;
      font-family: inherit;
      font-weight: 400;
      font-size: 14px;
      line-height: 1.42857143;
      outline-offset:-2px;
      padding: 6px 12px;
      text-align: center;
      touch-action: manipulation;
      user-select: none;
      white-space: nowrap;
      &.active {
        background-color: #e6e6e6;
        border-color: #adadad;
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
        font-weight: 400;
      }
      &:hover {
        background-color: #e6e6e6;
        border-color: #adadad;
      }
      &.active {
        background-color: #e6e6e6;
        border-color: #adadad;
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
        font-weight: 400;
        &:hover {
          background-color: #d4d4d4;
          border-color: #8c8c8c;
        }
      }
    }
  }
`
