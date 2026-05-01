import { FormattedMessage, IntlShape } from 'react-intl'
import { toDate } from 'date-fns-tz'
import coreUtils from '@opentripplanner/core-utils'
import React, { ReactElement, useEffect, useRef } from 'react'
import styled from 'styled-components'

import {
  DARK_TEXT_GREY,
  DEFAULT_ROUTE_COLOR,
  GREY_ON_WHITE
} from '../util/colors'
import { StopListEntry } from '../util/types'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

import DepartureTime from './departure-time'

const { time } = coreUtils
const { getCurrentDate } = time

const timeCellWidth = '45px'
const lowOpacity = '40%'

export const StopContainer = styled.ol<{ timeColumn?: boolean }>`
  color: ${DARK_TEXT_GREY};
  display: flex;
  flex-direction: column;
  gap: 8.5px;
  /* Calculate the height of the container a little short to ensure all stops
  are shown when browsers don't calculate 100% sensibly. */
  height: calc(100% - 140px);
  overflow-y: ${(props) => (props.timeColumn ? 'visible' : 'scroll')};
  padding: 5px 10px;

  .highlighted {
    opacity: 100%;

    div.stop-decoration {
      box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.1);
      opacity: 100%;

      div.stop-decoration::after {
        opacity: 100%;
      }
    }
  }

  .faded + .highlighted {
    div.stop-decoration::after {
      opacity: ${lowOpacity};
    }
  }
`

export const StopLink = styled.button`
  background-color: transparent;
  border: none;
  // Should this just be black to better contrast with the #666 in the faded class?
  color: ${DARK_TEXT_GREY} + 'da';
  padding: 0;
  text-align: left;
  width: 95%;

  &:hover {
    text-decoration: underline;
  }
`

export const Stop = styled.li<{ routeColor: string; timeColumn?: boolean }>`
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: ${(props) =>
    props.timeColumn ? `${timeCellWidth} 20px auto` : '20px auto'};
  white-space: nowrap;

  &.faded button {
    // The most faded we can get while still maintaining WCAG AA
    color: ${GREY_ON_WHITE};
  }

  .stop-time {
    font-size: 11px;
    text-align: right;
    width: ${timeCellWidth};
  }

  /* this is the station blob */
  div.stop-decoration {
    border: 5px solid ${(props) => props.routeColor};
    border-radius: 20px;
    display: block;
    height: 20px;
    opacity: ${lowOpacity};
    position: relative;
    width: 20px;

    /* this is the line between the blobs */
    &::after {
      background: ${(props) => props.routeColor};
      content: '';
      display: block;
      height: 1.65rem; /* set position in line-height agnostic way */
      position: relative;
      width: 10px;
      /* this is a few pixels into the blob (to make it look attached) and top aligned so that each
    stop's bar connects the previous bar with the current one */
      top: -1.8rem; /* adjust position in a way that is agnostic to line-height */
    }
  }

  /* hide the first line between blobs */
  &:first-of-type {
    div.stop-decoration::after {
      background: transparent;
    }
  }
`

interface StopListProps {
  fromIndex?: number
  homeTimezone?: any
  intl: IntlShape
  routeColor?: string
  setHoveredStop?: (id: string | null) => void
  stopLinkClicked: (arg: any) => void
  stops: StopListEntry[]
  toIndex?: number
}

const StopList = ({
  fromIndex,
  homeTimezone,
  intl,
  routeColor = DEFAULT_ROUTE_COLOR,
  setHoveredStop,
  stopLinkClicked,
  stops,
  toIndex
}: StopListProps): JSX.Element => {
  const startOfDay = toDate(getCurrentDate(homeTimezone), {
    timeZone: homeTimezone
  })
  const tripViewerHighLighter =
    fromIndex !== undefined &&
    fromIndex > -1 &&
    toIndex !== undefined &&
    toIndex > -1

  // If we're in the trip viewer and there's a highlighted section of the trip, scroll that section into view.
  const firstStopRef = useRef<HTMLLIElement>(null)
  useEffect(() => {
    firstStopRef?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
    // Also focus the first stop in the trip, for keyboard navigation
    firstStopRef?.current?.focus()
  }, [])

  return (
    <StopContainer
      aria-label={intl.formatMessage({
        id: 'components.TripViewer.listOfRouteStops'
      })}
      onMouseLeave={() => setHoveredStop && setHoveredStop(null)}
      timeColumn={stops.length > 0 && 'scheduledDeparture' in stops[0]}
    >
      {stops?.map((stop: StopListEntry, index: number) => {
        const highlighted = tripViewerHighLighter
          ? index >= fromIndex && index <= toIndex
          : true

        // Helpful invisible labels for screenreaders
        let stopLabel: ReactElement | undefined
        if (fromIndex === index) {
          stopLabel = (
            <FormattedMessage id="components.TripViewer.startOfTrip" />
          )
        }
        if (toIndex === index) {
          stopLabel = <FormattedMessage id="components.TripViewer.endOfTrip" />
        }
        return (
          <Stop
            className={highlighted ? 'highlighted' : 'faded'}
            // Use array index instead of stop id because a stop can be visited several times.
            key={index}
            onClick={() => stopLinkClicked(stop)}
            onMouseOver={
              () => setHoveredStop && setHoveredStop(stop.stopId || null)
              // eslint-disable-next-line react/jsx-curly-newline
            }
            ref={index === fromIndex ? firstStopRef : null}
            routeColor={
              routeColor?.includes('ffffff') ? DEFAULT_ROUTE_COLOR : routeColor
            }
            timeColumn={!!stop.scheduledDeparture}
          >
            {stop.scheduledDeparture && (
              <div
                aria-hidden
                className="stop-time"
                style={{ opacity: highlighted ? '100%' : '0%' }}
              >
                <DepartureTime originDate={startOfDay} stopTime={stop} />
              </div>
            )}
            <div className="stop-decoration" />
            <StopLink
              name={stop.name}
              onFocus={
                () => setHoveredStop && setHoveredStop(stop.stopId || null)
                // eslint-disable-next-line react/jsx-curly-newline
              }
            >
              {stopLabel && (
                <InvisibleA11yLabel>{stopLabel}</InvisibleA11yLabel>
              )}
              <InvisibleA11yLabel>
                <DepartureTime originDate={startOfDay} stopTime={stop} />
              </InvisibleA11yLabel>
              {stop.name}
            </StopLink>
          </Stop>
        )
      })}
    </StopContainer>
  )
}

export default StopList
