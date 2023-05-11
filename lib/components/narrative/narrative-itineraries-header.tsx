import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { ArrowRight } from '@styled-icons/fa-solid'
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { FormattedMessage, useIntl } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import { SortAmountDown } from '@styled-icons/fa-solid/SortAmountDown'
import { SortAmountUp } from '@styled-icons/fa-solid/SortAmountUp'
import React, { useState } from 'react'
import styled from 'styled-components'

import { Icon, IconWithText, StyledIconWrapper } from '../util/styledIcon'

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

const FilterSortButton = styled.button`
  background: #eee;
  border: none;
  border-radius: 5px;
  color: #090909cc;
  transition: all 0.15s ease;

  svg {
    margin-top: -2px;
  }

  &:hover {
    background: #fff;
    transition: all 0.15s ease;
  }
`

const ResultsSortSelect = styled.select`
  background: #eee;
  border: none;
  border-radius: 5px;
  padding: 5px;
`

const HeaderControlsContainer = styled.div<{ showHeaderText: boolean }>`
  display: flex;
  float: right;
  gap: 7px;
  margin-left: ${(props) => (props.showHeaderText ? 'inherit' : 'auto')};
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
  const [selectedFilter, setSelectedFilter] = useState('BEST')
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

  const sortResults = intl.formatMessage({
    id: 'components.NarrativeItinerariesHeader.sortResults'
  })

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
              <h1
                style={{
                  display: 'inline',
                  fontSize: '15px',
                  marginRight: '10px'
                }}
              >
                {pending ? (
                  <FormattedMessage id="components.NarrativeItinerariesHeader.searching" />
                ) : (
                  itinerariesFound
                )}
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
          <HeaderControlsContainer
            aria-label={sortResults}
            role="group"
            showHeaderText={!!showHeaderText}
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
            <ResultsSortSelect
              aria-label={intl.formatMessage({
                id: 'components.NarrativeItinerariesHeader.sortBy'
              })}
              onBlur={(e) => setSelectedFilter(e.target.value)}
              onChange={(e) => setSelectedFilter(e.target.value)}
              title={intl.formatMessage({
                id: 'components.NarrativeItinerariesHeader.sortBy'
              })}
              value={selectedFilter}
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
            </ResultsSortSelect>
            <FilterSortButton
              aria-label={sortResults}
              className="filter-sort-btn"
              onClick={() => onSortChange(selectedFilter)}
              title={sortResults}
            >
              <Icon Icon={ArrowRight} />
            </FilterSortButton>
          </HeaderControlsContainer>
          <PlanFirstLastButtons />
        </>
      )}
    </div>
  )
}
