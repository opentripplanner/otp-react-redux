import { Bell, BellSlash, Calendar, Clock } from '@styled-icons/fa-regular'
import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'

import { dayFieldsToArray } from '../../../util/monitored-trip'
import { MonitoredTripProps } from '../types'
import LocationIcon from '@opentripplanner/location-icon'
import styled from 'styled-components'

import { InlineLoading } from '../../narrative/loading'
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
    padding: 30px 20px 20px 20px;
    width: 100%;
  }
`
const TextWIcon = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 7px;
  justify-content: left;
  width: 250px;

  svg {
    flex-shrink: 0;
  }
`

const TripDetailWithIcon = styled(TextWIcon)`
  align-items: center;
  gap: 12px;
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
    const days = dayFieldsToArray(monitoredTrip)

    const testHandle = () => {
      if (handleTogglePauseMonitoring) {
        handleTogglePauseMonitoring()
      }
    }

    const notificationLabel = intl.formatMessage({
      id: 'components.ExistingAccountDisplay.notifications'
    })

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
              <LocationIcon size={14} type="from" />
            </span>
            <span>{from?.name}</span>
          </TextWIcon>
          <TextWIcon>
            <span
              title={intl.formatMessage({
                id: 'components.BatchSettings.destination'
              })}
            >
              <LocationIcon size={14} type="to" />
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
              <MonitoredDays days={days} />
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
