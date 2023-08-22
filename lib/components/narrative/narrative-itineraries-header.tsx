/* eslint-disable complexity */
import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { FormattedMessage, useIntl } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import { SortAmountDown } from '@styled-icons/fa-solid/SortAmountDown'
import { SortAmountUp } from '@styled-icons/fa-solid/SortAmountUp'
import React, { useCallback } from 'react'
import styled from 'styled-components'

import { IconWithText, StyledIconWrapper } from '../util/styledIcon'
import { sortOptions } from '../util/sortOptions'
import { SortResultsDropdown } from '../util/dropdown'
import { UnstyledButton } from '../util/unstyled-button'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import PopupTriggerText from '../app/popup-trigger-text'

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

const ItinerariesHeaderContainer = styled.div<{ showHeaderText: boolean }>`
  display: flex;
  float: left;
  gap: 8px;
  margin-left: ${(props) => (props.showHeaderText ? 'inherit' : 'auto')};
`

export default function NarrativeItinerariesHeader({
  customBatchUiBackground,
  enabledSortModes,
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
  enabledSortModes: string[]
  errors: unknown[]
  itineraries: unknown[]
  itinerary: Itinerary
  itineraryIsExpanded: boolean
  onSortChange: (type: string) => VoidFunction
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

  const sortResultsLabel = intl.formatMessage({
    id: 'components.NarrativeItinerariesHeader.sortResults'
  })

  // Transitions to the UI states below should be announced to assistive technology:
  // - A search is in progress.
  // - Results or no results are found (with or without errors).
  // - Sort order of trip results
  const searching = intl.formatMessage({
    id: 'components.NarrativeItinerariesHeader.searching'
  })
  const narrativeUiStatus = pending
    ? searching
    : intl.formatList([itinerariesFound, numIssues], { type: 'conjunction' })

  const sortOptionsArr = sortOptions(intl, enabledSortModes)
  const sortText = sortOptionsArr.find((x) => x.value === sort.type)?.text

  const handleSortClick = useCallback(
    (value) => {
      onSortChange(value)
    },
    [onSortChange]
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
      <InvisibleA11yLabel as="div" role="status">
        <p>{narrativeUiStatus}</p>
        {!pending && itineraries.length !== 0 && (
          <>
            <p>
              <FormattedMessage id="components.NarrativeItinerariesHeader.howToFindResults" />
            </p>
            <p>
              {intl.formatMessage(
                {
                  id: 'components.NarrativeItinerariesHeader.resultsSortedBy'
                },
                { sortSelected: sortText }
              )}
            </p>
          </>
        )}
      </InvisibleA11yLabel>

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
            // The "n Itineraries Found" a11y header is an <h2> element
            // because it falls under the "Plan your trip" <h1> header.
            <InvisibleA11yLabel as="h2">{itinerariesFound}</InvisibleA11yLabel>
          )}
          <ItinerariesHeaderContainer showHeaderText={showHeaderText}>
            {popupTarget && (
              <button onClick={() => setPopupContent(popupTarget)}>
                <PopupTriggerText compact popupTarget={popupTarget} />
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
            <SortResultsDropdown
              id="sort-results"
              label={sortResultsLabel}
              name={sortText}
              title={sortResultsLabel}
            >
              {sortOptionsArr.map((sortOption) => (
                <li className="sort-option" key={sortOption.value}>
                  <UnstyledButton
                    aria-selected={sortText === sortOption.text || undefined}
                    onClick={() => handleSortClick(sortOption.value)}
                    role="option"
                  >
                    {sortOption.text}
                  </UnstyledButton>
                </li>
              ))}
            </SortResultsDropdown>
          </ItinerariesHeaderContainer>
          <PlanFirstLastButtons />
        </>
      )}
    </div>
  )
}
