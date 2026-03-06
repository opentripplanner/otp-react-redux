import { IntlShape } from 'react-intl'

import { ItinerarySortOption } from '../../util/config-types'

type SortOptionEntry = { text: string; value: ItinerarySortOption }

export const sortOptions = (
  intl: IntlShape,
  enabledOptions: ItinerarySortOption[] = [
    'BEST',
    'DURATION',
    'ARRIVALTIME',
    'WALKTIME',
    'COST',
    'DEPARTURETIME',
    'FARE'
    // Emissions is disabled by default, as it does nothing unless CO₂ calculation is enabled
  ]
): SortOptionEntry[] => {
  const sortOptionsArray: SortOptionEntry[] = [
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
    },
    {
      text: intl.formatMessage({
        id: 'components.NarrativeItinerariesHeader.selectFare'
      }),
      value: 'FARE'
    },
    {
      text: intl.formatMessage({
        id: 'components.NarrativeItinerariesHeader.selectEmissions'
      }),
      value: 'EMISSIONS'
    }
  ]

  return sortOptionsArray.filter((sortOption) =>
    enabledOptions.includes(sortOption.value)
  )
}
