import styled from 'styled-components'

import Icon from '../narrative/icon'
import SaveTripButton from './save-trip-button'

const IssueButton = styled.button`
  background-color: #ECBE03;
  border: none;
  border-radius: 5px;
  display: inline-block;
  font-size: 12px;
  padding: 4px;

  span {
    margin-left: 4px;
  }
`

export default function NarrativeItinerariesHeader ({
  errors,
  itineraries,
  itineraryIsExpanded,
  onSortChange,
  onSortDirChange,
  onToggleShowErrors,
  onViewAllOptions,
  pending,
  showingErrors,
  sort
}) {
  let resultText, titleText
  if (pending) {
    resultText = 'Finding your options...'
    titleText = 'Finding your options...'
  } else {
    const itineraryPlural = itineraries.length === 1
      ? 'itinerary'
      : 'itineraries'
    const issuePlural = errors.length === 1
      ? 'issue'
      : 'issues'
    resultText = `${itineraries.length} ${itineraryPlural} found.`
    titleText = errors.length > 0
      ? `${itineraries.length} ${itineraryPlural} (and ${errors.length} ${issuePlural}) found`
      : resultText
  }

  return (
    <div
      className='options header'
      style={{
        alignItems: 'end',
        display: 'flex'
      }}
    >
      {(itineraryIsExpanded || showingErrors)
        ? <>
          <button
            className='clear-button-formatting'
            onClick={onViewAllOptions}
          >
            <Icon type='arrow-left' /> View all options
          </button>

          {itineraryIsExpanded && <SaveTripButton />}
        </>
        : <>
          <div
            style={{flexGrow: 1}}
            title={titleText}
          >
            <span style={{
              marginRight: '10px'
            }}>
              {resultText}
            </span>
            {errors.length > 0 && (
              <IssueButton onClick={onToggleShowErrors}>
                <Icon type='warning' />
                <span>{errors.length} issues</span>
              </IssueButton>
            )}
          </div>
          <div style={{display: 'flex', float: 'right'}}>
            <button
              className='clear-button-formatting'
              onClick={onSortDirChange}
              style={{marginRight: '5px'}}
            >
              <Icon type={`sort-amount-${sort.direction.toLowerCase()}`} />
            </button>
            <select
              onBlur={onSortChange}
              onChange={onSortChange}
              value={sort.value}
            >
              <option value='BEST'>Best option</option>
              <option value='DURATION'>Duration</option>
              <option value='ARRIVALTIME'>Arrival time</option>
              <option value='DEPARTURETIME'>Departure time</option>
              <option value='WALKTIME'>Walk time</option>
              <option value='COST'>Cost</option>
            </select>
          </div>
        </>
      }
    </div>
  )
}
