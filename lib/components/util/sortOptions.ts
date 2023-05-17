import { useIntl } from 'react-intl'

export const sortOptions = (): {
  text: string
  value: string
}[] => {
  const OptionText = (id: string) => {
    const intl = useIntl()
    return intl.formatMessage({ id: id })
  }

  const sortOptionsArray = [
    {
      text: OptionText('components.NarrativeItinerariesHeader.selectBest'),
      value: 'BEST'
    },
    {
      text: OptionText('components.NarrativeItinerariesHeader.selectDuration'),
      value: 'DURATION'
    },
    {
      text: OptionText(
        'components.NarrativeItinerariesHeader.selectArrivalTime'
      ),
      value: 'ARRIVALTIME'
    },
    {
      text: OptionText(
        'components.NarrativeItinerariesHeader.selectDepartureTime'
      ),
      value: 'DEPARTURETIME'
    },
    {
      text: OptionText('components.NarrativeItinerariesHeader.selectWalkTime'),
      value: 'WALKTIME'
    },
    {
      text: OptionText('components.NarrativeItinerariesHeader.selectCost'),
      value: 'COST'
    }
  ]

  return sortOptionsArray
}
