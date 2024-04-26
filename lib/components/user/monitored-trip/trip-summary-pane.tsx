import { Bell, BellSlash, Calendar, Clock } from '@styled-icons/fa-regular'
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl'
import LocationIcon from '@opentripplanner/location-icon'
import React from 'react'
import styled from 'styled-components'

import { dayFieldsToArray } from '../../../util/monitored-trip'
import { InlineLoading } from '../../narrative/loading'
import { MonitoredTripProps } from '../types'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import MonitoredDays from './trip-monitored-days'
import TripSummary from './trip-duration-summary'

/**
 * Displays the summary information of a monitored trip.
 */

const SavedTripBody = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 0 0 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0;
  }
`

const LocationDetails = styled.div`
  align-items: start;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  padding: 20px;
  padding-right: 30px;
  width: 50%;

  @media (max-width: 768px) {
    align-items: center;
    border-bottom: 1px solid #ddd;
    border-right: 0;
    border-top: 1px solid #ddd;
    padding: 30px 20px 30px 20px;
    width: 100%;
  }
`
const ItineraryDetails = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  padding-left: 30px;

  @media (max-width: 768px) {
    padding-top: 30px;
    width: 100%;
  }
`
const TextWIcon = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 7px;
  justify-content: left;
  // TODO: Do this in grid
  width: 250px;

  svg {
    flex-shrink: 0;
  }
`

const TripDetailWithIcon = styled(TextWIcon)`
  align-items: center;
  gap: 12px;
  // TODO: Do this in grid
  width: 273px;

  svg {
    width: 16px;
  }

  &:last-of-type {
    align-items: flex-start;

    svg {
      margin-top: 2px;
    }
  }
`

const TripDetailsList = styled.ul`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: center;
  list-style: none;
  padding: 0;
`

const ToggleNotificationButton = styled.button`
  background: transparent;
  border: none;
  font-style: italic;
  padding: 0;
  text-decoration: underline;
`

const TripSummaryPane = ({
  from,
  handleTogglePauseMonitoring,
  monitoredTrip,
  pendingRequest,
  to
}: MonitoredTripProps): JSX.Element => {
  const intl = useIntl()
  const { itinerary, leadTimeInMinutes } = monitoredTrip
  if (!itinerary) {
    return (
      <div>
        <FormattedMessage id="common.itineraryDescriptions.noItineraryToDisplay" />
      </div>
    )
  } else {
    const monitoredDays = dayFieldsToArray(monitoredTrip)
    const isOneTime = monitoredDays.length === 0
    // For one-time trips, just print the date the trip is taken.
    // For recurrent trips, print the days the trip will be monitored.
    const displayedDays = isOneTime ? (
      <FormattedDate dateStyle="full" value={itinerary.startTime} />
    ) : (
      <MonitoredDays days={monitoredDays} />
    )

    const testHandle = () => {
      if (handleTogglePauseMonitoring) {
        handleTogglePauseMonitoring()
      }
    }

    const notificationLabel = intl.formatMessage({
      id: 'components.ExistingAccountDisplay.notifications'
    })

    const ICON_SIZE = 14

    return (
      <SavedTripBody>
        <InvisibleA11yLabel>
          <FormattedMessage
            id="components.SavedTripList.fromTo"
            values={{ from: from?.name, to: to?.name }}
          />
        </InvisibleA11yLabel>
        <LocationDetails aria-hidden>
          <TextWIcon>
            {/* Location Icon does not allow a title prop so use a span wrapper for a title tooltip */}
            <span
              title={intl.formatMessage({
                id: 'components.BatchSettings.origin'
              })}
            >
              <LocationIcon size={ICON_SIZE} type="from" />
            </span>
            <span>{from?.name}</span>
          </TextWIcon>
          <TextWIcon>
            <span
              title={intl.formatMessage({
                id: 'components.BatchSettings.destination'
              })}
            >
              <LocationIcon size={ICON_SIZE} type="to" />
            </span>
            <span>{to?.name}</span>
          </TextWIcon>
        </LocationDetails>
        <ItineraryDetails>
          <TripDetailsList>
            {/* Trip time and duration */}
            <TripDetailWithIcon as="li">
              <Clock
                aria-hidden
                title={intl.formatMessage({
                  id: 'components.TripSummaryPane.timeAndDuration'
                })}
              />
              <TripSummary monitoredTrip={monitoredTrip} />
            </TripDetailWithIcon>
            {/* Available trip days */}
            <TripDetailWithIcon as="li">
              <Calendar
                aria-hidden
                title={intl.formatMessage({
                  id: 'components.TripSummaryPane.monitoredTripDays'
                })}
              />
              {displayedDays}
            </TripDetailWithIcon>
            {/* Trip notification info */}
            <TripDetailWithIcon as="li">
              {monitoredTrip.isActive ? (
                <Bell
                  aria-label={notificationLabel}
                  title={notificationLabel}
                />
              ) : (
                <BellSlash width={20} />
              )}
              <span>
                {monitoredTrip.isActive ? (
                  <FormattedMessage
                    id="components.TripSummaryPane.notifications"
                    values={{ leadTimeInMinutes }}
                  />
                ) : (
                  <FormattedMessage
                    id="components.TripSummaryPane.notificationsDisabled"
                    values={{ leadTimeInMinutes }}
                  />
                )}
                <br />
                <ToggleNotificationButton
                  disabled={pendingRequest === 'pause'}
                  onClick={testHandle}
                >
                  {pendingRequest === 'pause' ? (
                    /* Make loader fit */
                    <InlineLoading />
                  ) : monitoredTrip.isActive ? (
                    <FormattedMessage id="components.SavedTripList.pause" />
                  ) : (
                    <FormattedMessage id="components.SavedTripList.resume" />
                  )}
                </ToggleNotificationButton>
              </span>
            </TripDetailWithIcon>
          </TripDetailsList>
        </ItineraryDetails>
      </SavedTripBody>
    )
  }
}

export default TripSummaryPane
