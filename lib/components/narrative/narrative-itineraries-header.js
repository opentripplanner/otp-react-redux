import styled from 'styled-components'

import Icon from '../narrative/icon'

import PlanFirstLastButtons from './plan-first-last-buttons'
import SaveTripButton from './save-trip-button'

const IssueButton = styled.button`
  background-color: #ECBE03;
  border: none;
  border-radius: 5px;
  display: inline-block;
  font-size: 12px;
  padding: 2px 4px;
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
        display: 'flex',
        flexWrap: 'wrap'
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
          {itineraryIsExpanded && (
            // marginLeft: auto is a way of making something "float right"
            // within a flex container
            // see https://stackoverflow.com/a/36182782/269834
            <div style={{marginLeft: 'auto'}}>
              <SaveTripButton />
            </div>
          )}
        </>
        : <>
          <div
            style={{flexGrow: 1}}
            title={titleText}
          >
            <span style={{marginRight: '10px'}}>
              {resultText}
            </span>
            {errors.length > 0 && (
              <IssueButton onClick={onToggleShowErrors}>
                <Icon style={{fontSize: 11, marginRight: 2}} type='warning' />
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
              value={sort.type}
            >
              <option value='BEST'>Best option</option>
              <option value='DURATION'>Duration</option>
              <option value='ARRIVALTIME'>Arrival time</option>
              <option value='DEPARTURETIME'>Departure time</option>
              <option value='WALKTIME'>Walk time</option>
              <option value='COST'>Cost</option>
            </select>
          </div>
          <PlanFirstLastButtons />
        </>
      }
    </div>
  )
}
