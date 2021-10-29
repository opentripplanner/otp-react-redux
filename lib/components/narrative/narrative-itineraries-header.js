import styled from 'styled-components'
import { FormattedMessage, useIntl } from 'react-intl'

import Icon from '../util/icon'

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
  const intl = useIntl()

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
            <Icon type='arrow-left' /> <FormattedMessage id='components.NarrativeItinerariesHeader.viewAll' />
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
            title={intl.formatMessage(
              {id: 'components.NarrativeItinerariesHeader.titleText'},
              {
                issueNum: errors.length,
                itineraryNum: itineraries.length,
                pending
              }
            )}
          >
            <span style={{marginRight: '10px'}}>
              <FormattedMessage
                id='components.NarrativeItinerariesHeader.resultText'
                values={{
                  itineraryNum: itineraries.length,
                  pending
                }}
              />
            </span>
            {errors.length > 0 && (
              <IssueButton onClick={onToggleShowErrors}>
                <Icon style={{fontSize: 11, marginRight: 2}} type='warning' />
                <span>
                  <FormattedMessage
                    id='components.NarrativeItinerariesHeader.numIssues'
                    values={{issueNum: errors.length}}
                  />
                </span>
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
              <option value='BEST'>{intl.formatMessage({id: 'components.NarrativeItinerariesHeader.selectBest'})}</option>
              <option value='DURATION'>{intl.formatMessage({id: 'components.NarrativeItinerariesHeader.selectDuration'})}</option>
              <option value='ARRIVALTIME'>{intl.formatMessage({id: 'components.NarrativeItinerariesHeader.selectArrivalTime'})}</option>
              <option value='DEPARTURETIME'>{intl.formatMessage({id: 'components.NarrativeItinerariesHeader.selectDepartureTime'})}</option>
              <option value='WALKTIME'>{intl.formatMessage({id: 'components.NarrativeItinerariesHeader.selectWalkTime'})}</option>
              <option value='COST'>{intl.formatMessage({id: 'components.NarrativeItinerariesHeader.selectCost'})}</option>
            </select>
          </div>
          <PlanFirstLastButtons />
        </>
      }
    </div>
  )
}
