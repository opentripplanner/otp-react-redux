import { IntlShape } from 'react-intl'
import { ModeButtonDefinition, ModeSetting } from '@opentripplanner/types'
import React from 'react'

import { getFormattedMode } from '../../util/i18n'

// This method is used to daisy-chain a series of functions together on a given value
export function pipe<T>(...fns: Array<(arg: T) => T>) {
  return (value: T) => fns.reduce((acc, fn) => fn(acc), value)
}

export const populateSettingWithIcon =
  (ModeIcon: React.ComponentType<{ mode?: string; width?: number }>) =>
  // eslint-disable-next-line react/display-name
  (msd: ModeSetting): ModeSetting => ({
    ...msd,
    icon: <ModeIcon mode={msd.iconName} width={16} />
  })

export const addModeButtonIcon =
  (ModeIcon: React.ComponentType<{ mode?: string; width?: number }>) =>
  (def: ModeButtonDefinition): ModeButtonDefinition => ({
    ...def,
    Icon: function ModeButtonIcon() {
      return <ModeIcon mode={def.iconName} />
    }
  })

export const addCustomSettingLabels =
  (intl: IntlShape) =>
  (msd: ModeSetting): ModeSetting => {
    let modeLabel
    // If we're using route mode overrides, make sure we're using the custom mode name
    if (msd.type === 'SUBMODE') {
      modeLabel = msd.overrideMode || msd.addTransportMode.mode
      return {
        ...msd,
        label: getFormattedMode(modeLabel, intl)
      }
    }
    return msd
  }
