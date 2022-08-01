import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import Icon from '../util/icon'

import PlanFirstLastButtons from './plan-first-last-buttons'
import SaveTripButton from './save-trip-button'

const IssueButton = styled.button`
  background-color: #ecbe03;
  border: none;
  border-radius: 5px;
  display: inline-block;
  font-size: 12px;
  padding: 2px 4px;
`

export default function NarrativeItinerariesHeader({
  customBatchUiBackground,
  errors,
  itineraries,
  itineraryIsExpanded,
  onSortChange,
  onSortDirChange,
  onToggleShowErrors,
  onViewAllOptions,
  pending,
  popupTarget,
  setPopupContent,
  showHeaderText = true,
  showingErrors,
  sort
}: {
  customBatchUiBackground?: boolean
  errors: unknown[]
  itineraries: unknown[]
  itineraryIsExpanded: boolean
  onSortChange: () => void
  onSortDirChange: () => void
  onToggleShowErrors: () => void
  onViewAllOptions: () => void
  pending: boolean
  popupTarget: string
  setPopupContent: (url: string) => void
  showHeaderText: boolean
  showingErrors: boolean
  sort: { direction: string; type: string }
}): JSX.Element {
  const intl = useIntl()
  const itinerariesFound = intl.formatMessage(
    {
      id: 'components.NarrativeItinerariesHeader.itinerariesFound'
    },
    { itineraryNum: itineraries.length }
  )
  const numIssues = intl.formatMessage(
    {
      id: 'components.NarrativeItinerariesHeader.numIssues'
    },
    { issueNum: errors.length }
  )

  return (
    <div
      className="options header"
      style={{
        alignItems: 'end',
        display: 'flex',
        flexWrap: 'wrap'
      }}
    >
      {itineraryIsExpanded || showingErrors ? (
        <>
          <button
            className="clear-button-formatting"
            onClick={onViewAllOptions}
          >
            <Icon type="arrow-left" withSpace />
            <FormattedMessage id="components.NarrativeItinerariesHeader.viewAll" />
          </button>
          {itineraryIsExpanded && (
            // marginLeft: auto is a way of making something "float right"
            // within a flex container
            // see https://stackoverflow.com/a/36182782/269834
            <div style={{ marginLeft: 'auto' }}>
              <SaveTripButton />
            </div>
          )}
        </>
      ) : (
        <>
          {showHeaderText && (
            <div
              style={{ flexGrow: 1 }}
              title={
                pending
                  ? intl.formatMessage({
                      id: 'components.NarrativeItinerariesHeader.searching'
                    })
                  : intl.formatMessage(
                      {
                        id: 'components.NarrativeItinerariesHeader.itinerariesAndIssues'
                      },
                      {
                        itinerariesFound,
                        numIssues
                      }
                    )
              }
            >
              <span style={{ marginRight: '10px' }}>
                {pending ? (
                  <FormattedMessage id="components.NarrativeItinerariesHeader.searching" />
                ) : (
                  itinerariesFound
                )}
              </span>
              {errors.length > 0 && (
                <IssueButton onClick={onToggleShowErrors}>
                  <Icon
                    style={{ fontSize: 11, marginRight: 2 }}
                    type="warning"
                  />
                  <span>{numIssues}</span>
                </IssueButton>
              )}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              float: 'right',
              gap: 5,
              marginLeft: showHeaderText ? 'inherit' : 'auto'
            }}
          >
            {popupTarget && (
              <button onClick={() => setPopupContent(popupTarget)}>
                <FormattedMessage id={`config.popups.${popupTarget}`} />
              </button>
            )}
            <button
              className="clear-button-formatting"
              onClick={onSortDirChange}
            >
              <Icon
                className={`${customBatchUiBackground && 'base-color-bg'}`}
                type={`sort-amount-${sort.direction.toLowerCase()}`}
              />
            </button>
            <select
              onBlur={onSortChange}
              onChange={onSortChange}
              value={sort.type}
            >
              <option value="BEST">
                {intl.formatMessage({
                  id: 'components.NarrativeItinerariesHeader.selectBest'
                })}
              </option>
              <option value="DURATION">
                {intl.formatMessage({
                  id: 'components.NarrativeItinerariesHeader.selectDuration'
                })}
              </option>
              <option value="ARRIVALTIME">
                {intl.formatMessage({
                  id: 'components.NarrativeItinerariesHeader.selectArrivalTime'
                })}
              </option>
              <option value="DEPARTURETIME">
                {intl.formatMessage({
                  id: 'components.NarrativeItinerariesHeader.selectDepartureTime'
                })}
              </option>
              <option value="WALKTIME">
                {intl.formatMessage({
                  id: 'components.NarrativeItinerariesHeader.selectWalkTime'
                })}
              </option>
              <option value="COST">
                {intl.formatMessage({
                  id: 'components.NarrativeItinerariesHeader.selectCost'
                })}
              </option>
            </select>
          </div>
          <PlanFirstLastButtons />
        </>
      )}
    </div>
  )
}
