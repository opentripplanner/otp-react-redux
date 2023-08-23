import { IntlShape } from 'react-intl'

export type SortOptionsType =
  | 'BEST'
  | 'DURATION'
  | 'ARRIVALTIME'
  | 'DEPARTURETIME'
  | 'WALKTIME'
  | 'COST'

export const sortOptions = (
  intl: IntlShape,
  enabledOptions: SortOptionsType[] = [
    'BEST',
    'DURATION',
    'ARRIVALTIME',
    'WALKTIME',
    'COST',
    'DEPARTURETIME'
  ]
): {
  text: string
  value: string
}[] => {
  const sortOptionsArray = [
    {
      text: intl.formatMessage({
        id: 'components.NarrativeItinerariesHeader.selectBest'
      }),
      value: 'BEST'
    },
    {
      text: intl.formatMessage({
        id: 'components.NarrativeItinerariesHeader.selectDuration'
      }),
      value: 'DURATION'
    },
    {
      text: intl.formatMessage({
        id: 'components.NarrativeItinerariesHeader.selectArrivalTime'
      }),
      value: 'ARRIVALTIME'
    },
    {
      text: intl.formatMessage({
        id: 'components.NarrativeItinerariesHeader.selectDepartureTime'
      }),
      value: 'DEPARTURETIME'
    },
    {
      text: intl.formatMessage({
        id: 'components.NarrativeItinerariesHeader.selectWalkTime'
      }),
      value: 'WALKTIME'
    },
    {
      text: intl.formatMessage({
        id: 'components.NarrativeItinerariesHeader.selectCost'
      }),
      value: 'COST'
    }
  ]

  return sortOptionsArray.filter((sortOption) =>
    // @ts-expect-error TODO: why is this failing
    enabledOptions.includes(sortOption.value)
  )
}
