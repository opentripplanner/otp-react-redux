import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { FormattedMessage, useIntl } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import { SortAmountDown } from '@styled-icons/fa-solid/SortAmountDown'
import { SortAmountUp } from '@styled-icons/fa-solid/SortAmountUp'
import React from 'react'
import styled from 'styled-components'

import { IconWithText, StyledIconWrapper } from '../util/styledIcon'
import { sortOptions } from '../util/sortOptions'
import { UnstyledButton } from '../util/unstyled-button'
import Dropdown from '../util/dropdown'
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
      <InvisibleA11yLabel as="div" role="status">
        <p>{narrativeUiStatus}</p>
        {!pending && itineraries.length !== 0 && (
          <p>
            <FormattedMessage id="components.NarrativeItinerariesHeader.howToFindResults" />
          </p>
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
          <div
            style={{
              display: 'flex',
              float: 'right',
              gap: 7,
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
            <Dropdown
              id="sort-results"
              label={intl.formatMessage({
                id: 'components.NarrativeItinerariesHeader.sortResults'
              })}
              name={intl.formatMessage({
                id: 'components.NarrativeItinerariesHeader.sortResults'
              })}
            >
              {sortOptions.map((x) => {
                return (
                  <li key={x.value}>
                    <UnstyledButton onClick={() => onSortChange(x.value)}>
                      <FormattedMessage id={x.locale} />
                    </UnstyledButton>
                  </li>
                )
              })}
            </Dropdown>
          </div>
          <PlanFirstLastButtons />
        </>
      )}
    </div>
  )
}
