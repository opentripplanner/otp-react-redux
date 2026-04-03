import { FormattedMessage } from 'react-intl'
import { getCurrentDate } from '@opentripplanner/core-utils/lib/time'
import { toDate } from 'date-fns-tz'
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { DEFAULT_ROUTE_COLOR } from '../util/colors'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

import { RenderProps } from './styled'
import DepartureTime from './departure-time'

type StopProps = RenderProps & { timeColumn?: boolean }

const timeCellWidth = '45px'
const lowOpacity = '40%'

export const StopContainer = styled.ol<StopProps>`
  color: ${(props) => props?.textColor};
  padding: 5px 10px;
  background-color: ${(props) => props?.backgroundColor};
  overflow-y: ${(props) => (props.timeColumn ? 'visible' : 'scroll')};
  /* Calculate the height of the container a little short to ensure all stops 
  are shown when browsers don't calculate 100% sensibly. */
  height: calc(100% - 140px);
  display: flex;
  flex-direction: column;
  gap: 8.5px;

  .highlighted {
    opacity: 100%;

    div.stop-decoration {
      box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.1);
    }
  }

  .faded + .highlighted {
    div.stop-decoration::after {
      opacity: ${lowOpacity};
    }
  }
`

export const StopLink = styled.button<RenderProps>`
  color: ${(props) => props?.textColor + 'da'};
  background-color: transparent;
  border: none;
  padding: 0;
  text-align: left;
  width: 95%;

  &:hover {
    color: ${(props) => props?.textColor};
    text-decoration: underline;
  }
`

export const Stop = styled.li<StopProps>`
  display: grid;
  grid-template-columns: ${(props) =>
    props.timeColumn ? `${timeCellWidth} 20px auto` : '20px auto'};
  align-items: center;
  gap: 14px;
  opacity: ${lowOpacity};
  white-space: nowrap;

  .stop-time {
    font-size: 11px;
    text-align: right;
    width: ${timeCellWidth};
  }

  /* this is the station blob */
  div.stop-decoration {
    position: relative;
    display: block;
    height: 20px;
    width: 20px;
    border: 5px solid
      ${(props) =>
        props.useRouteColorAsBg ? props.textColor + 'ee' : props.routeColor};
    background: ${(props) =>
      props.useRouteColorAsBg ? props.routeColor : '#fff'};
    border-radius: 20px;

    /* this is the line between the blobs */
    &::after {
      content: '';
      display: block;
      height: 1.65rem; /* set position in line-height agnostic way */
      width: 10px;
      background: ${(props) =>
        props.useRouteColorAsBg ? props.textColor + 'ee' : props.routeColor};
      position: relative;
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
  backgroundColor?: string
  fromIndex?: number
  homeTimezone?: any
  routeColor?: string
  routePattern: any
  setHoveredStop?: (arg: any) => void
  stopLinkClicked: (arg: any) => void
  textColor?: string
  toIndex?: number
  useRouteColorAsBackground?: boolean
}

const StopList = ({
  backgroundColor,
  routeColor = DEFAULT_ROUTE_COLOR,
  homeTimezone,
  routePattern,
  setHoveredStop,
  stopLinkClicked,
  textColor,
  useRouteColorAsBackground,
  fromIndex,
  toIndex
}: StopListProps): JSX.Element => {
  // The stops in the pattern viewer vs the trip viewer are organized slightly differently, so account for that:
  const stopsArray =
    routePattern.stops ||
    routePattern.map((x: any) => ({
      ...x.stop,
      scheduledDeparture: x.scheduledDeparture
    }))
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
      backgroundColor={backgroundColor}
      onMouseLeave={() => setHoveredStop && setHoveredStop(null)}
      textColor={textColor}
      timeColumn={stopsArray[0].scheduledDeparture}
    >
      {stopsArray?.map((stop: any, index: number) => {
        const highlighted = tripViewerHighLighter
          ? index >= fromIndex && index <= toIndex
          : true

        // Helpful invisible labels for screenreaders
        let stopLabel = null
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
            onMouseOver={() => setHoveredStop && setHoveredStop(stop.id)}
            ref={index === fromIndex ? firstStopRef : null}
            routeColor={
              routeColor?.includes('ffffff') ? DEFAULT_ROUTE_COLOR : routeColor
            }
            textColor={textColor}
            timeColumn={stop.scheduledDeparture}
            useRouteColorAsBg={useRouteColorAsBackground}
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
              onFocus={() => setHoveredStop && setHoveredStop(stop.id)}
              textColor={textColor}
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
