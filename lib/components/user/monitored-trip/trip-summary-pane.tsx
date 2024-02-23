import { Bell, BellSlash, Calendar, Clock } from '@styled-icons/fa-regular'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import { dayFieldsToArray } from '../../../util/monitored-trip'
import { MonitoredTripProps } from '../types'
import LocationIcon from '@opentripplanner/location-icon'
import styled from 'styled-components'

import { InlineLoading } from '../../narrative/loading'

import MonitoredDays from './trip-monitored-days'
import TripSummary from './trip-summary'

/**
 * Displays the summary information of a monitored trip.
 */

const SavedTripBody = styled.div`
  display: flex;
  padding: 0 15px;
  justify-content: center;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`

const LocationDetails = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: start;
  justify-content: center;
  padding: 20px;
  border-right: 1px solid #ddd;

  @media (max-width: 600px) {
    border-right: 0;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
    width: 100%;
    align-items: center;
  }
`
const ItineraryDetails = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  width: 50%;

  @media (max-width: 600px) {
    width: 100%;
  }
`
const TextWIcon = styled.div`
  align-items: center;
  justify-content: left;
  display: flex;
  gap: 7px;
  width: 250px;

  svg {
    flex-shrink: 0;
  }
`

const TripDetailWithIcon = styled(TextWIcon)`
  gap: 12px;

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
  list-style: none;
  align-items: start;
  justify-content: center;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0;
`

const ToggleNotificationButton = styled.button`
  background: transparent;
  border: none;
  text-decoration: underline;
  padding: 0;
`

const TripSummaryPane = ({
  from,
  handleTogglePauseMonitoring,
  monitoredTrip,
  pendingRequest,
  to
}: MonitoredTripProps): JSX.Element => {
  const { itinerary, leadTimeInMinutes } = monitoredTrip
  if (!itinerary) {
    return (
      <div>
        <FormattedMessage id="common.itineraryDescriptions.noItineraryToDisplay" />
      </div>
    )
  } else {
    const days = dayFieldsToArray(monitoredTrip)

    const testHandle = () => {
      // @ts-expect-error hsdf
      handleTogglePauseMonitoring()
    }

    return (
      <SavedTripBody>
        {/* TODO: use the modern itinerary summary built for trip comparison. */}
        <LocationDetails>
          <TextWIcon>
            <LocationIcon size={14} type="from" />
            <span>{from?.name}</span>
          </TextWIcon>
          <TextWIcon>
            <LocationIcon size={14} type="to" />
            <span>{to?.name}</span>
          </TextWIcon>
        </LocationDetails>
        <ItineraryDetails>
          <TripDetailsList>
            <TripDetailWithIcon as="li">
              <Clock />
              <TripSummary monitoredTrip={monitoredTrip} />
            </TripDetailWithIcon>
            <TripDetailWithIcon as="li">
              <Calendar />
              <MonitoredDays days={days} />
            </TripDetailWithIcon>
            <TripDetailWithIcon as="li">
              {monitoredTrip.isActive ? <Bell /> : <BellSlash width={20} />}
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
                    <>
                      <FormattedMessage id="components.SavedTripList.pause" />
                    </>
                  ) : (
                    <>
                      <FormattedMessage id="components.SavedTripList.resume" />
                    </>
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
