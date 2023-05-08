import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { FormattedMessage, useIntl } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import { SortAmountDown } from '@styled-icons/fa-solid/SortAmountDown'
import { SortAmountUp } from '@styled-icons/fa-solid/SortAmountUp'
import React from 'react'
import styled from 'styled-components'

import { IconWithText, StyledIconWrapper } from '../util/styledIcon'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

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

// h1 element for a11y purposes

const InvisibleHeader = styled.h1`
  height: 0;
  overflow: hidden;
  width: 0;
`

export default function NarrativeItinerariesHeader({
  customBatchUiBackground,
  errors,
  itineraries,
  itinerary,
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
  itinerary: Itinerary
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

  // Transitions to the UI states below should be announced to assistive technology:
  // - A search is in progress.
  // - Results or no results are found (with or without errors).
  const searching = intl.formatMessage({
    id: 'components.NarrativeItinerariesHeader.searching'
  })
  const narrativeUiStatus = pending
    ? searching
    : intl.formatList([itinerariesFound, numIssues], { type: 'conjunction' })

  return (
    <div
      className="options header"
      style={{
        alignItems: 'end',
        display: 'flex',
        flexWrap: 'wrap'
      }}
    >
      <InvisibleA11yLabel role="status">{narrativeUiStatus}</InvisibleA11yLabel>

      {itineraryIsExpanded || showingErrors ? (
        <>
          <button
            className="clear-button-formatting"
            onClick={onViewAllOptions}
          >
            <IconWithText Icon={ArrowLeft}>
              <FormattedMessage id="components.NarrativeItinerariesHeader.viewAll" />
            </IconWithText>
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
          {showHeaderText ? (
            <div style={{ flexGrow: 1 }}>
              <h1
                style={{
                  display: 'inline',
                  fontSize: '15px',
                  marginRight: '10px'
                }}
              >
                {pending ? searching : itinerariesFound}
              </h1>
              {errors.length > 0 && (
                <IssueButton onClick={onToggleShowErrors}>
                  <IconWithText Icon={ExclamationTriangle}>
                    <span>{numIssues}</span>
                  </IconWithText>
                </IssueButton>
              )}
            </div>
          ) : (
            <InvisibleHeader>{itinerariesFound}</InvisibleHeader>
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
              title={intl.formatMessage({
                id: 'components.NarrativeItinerariesHeader.changeSortDir'
              })}
            >
              <StyledIconWrapper
                className={`${customBatchUiBackground && 'base-color-bg'}`}
              >
                {sort.direction.toLowerCase() === 'asc' ? (
                  <SortAmountUp />
                ) : (
                  <SortAmountDown />
                )}
              </StyledIconWrapper>
            </button>
            <select
              aria-label={intl.formatMessage({
                id: 'components.NarrativeItinerariesHeader.sortBy'
              })}
              onBlur={onSortChange}
              onChange={onSortChange}
              title={intl.formatMessage({
                id: 'components.NarrativeItinerariesHeader.sortBy'
              })}
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
