import { IntlShape } from 'react-intl'

/**
 * Gets a list of standard options for the MobilityProfileSelector
 * by combining assistive device use and vision limitations.
 */
export function getMobilityProfileOptions(intl: IntlShape): {
  text: string
  value: string
}[] {
  // Where applicable, device and vision codes used below are from DevicePane > devices in the language files.
  const rawProfiles = [
    {
      device: 'none',
      value: 'None'
    },
    {
      // This text will be displayed as is.
      device: 'Some mobility limitations but not using an assistive device',
      value: 'Some'
    },
    {
      device: [
        'cane',
        'crutches',
        'manual walker',
        'service animal',
        'stroller',
        'wheeled walker'
      ],
      value: 'Device'
    },
    {
      device: 'manual wheelchair',
      value: 'WChairM'
    },
    {
      device: 'electric wheelchair',
      value: 'WChairE'
    },
    {
      device: 'mobility scooter',
      value: 'MScooter'
    }
  ]

  const visionLevels = [
    {
      level: undefined,
      value: ''
    },
    {
      level: 'low-vision',
      value: 'LowVision'
    },
    {
      level: 'legally-blind',
      value: 'Blind'
    }
  ]

  return rawProfiles.flatMap((p) =>
    visionLevels.map((vision) => ({
      text:
        (typeof p.device === 'string'
          ? intl.formatMessage({
              id: `components.MobilityProfile.DevicesPane.devices.${p.device}`
            })
          : 'length' in p.device
          ? p.device
              .map((d) =>
                intl.formatMessage({
                  id: `components.MobilityProfile.DevicesPane.devices.${d}`
                })
              )
              .join('/')
          : '') +
        (vision.level
          ? ' + ' +
            intl.formatMessage({
              id: `components.MobilityProfile.LimitationsPane.visionLimitations.${vision.level}`
            })
          : ''),
      value:
        p.value === 'None' && vision.level
          ? vision.value
          : p.value !== 'None'
          ? p.value + (vision.level ? '-' + vision.value : '')
          : 'None'
    }))
  )
}
