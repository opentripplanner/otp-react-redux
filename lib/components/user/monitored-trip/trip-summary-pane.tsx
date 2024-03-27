import { Bell, BellSlash, Calendar, Clock } from '@styled-icons/fa-regular'
import { FormattedMessage, IntlShape } from 'react-intl'
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

interface Props extends MonitoredTripProps {
  intl: IntlShape
}

const SavedTripBody = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 15px;

  @media (max-width: 600px) {
    flex-direction: column;
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
  width: 50%;

  @media (max-width: 600px) {
    align-items: center;
    border-bottom: 1px solid #ddd;
    border-right: 0;
    border-top: 1px solid #ddd;
    width: 100%;
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
  display: flex;
  gap: 7px;
  justify-content: left;
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
  align-items: start;
  display: flex;
  flex-direction: column;
  list-style: none;
  gap: 15px;
  justify-content: center;
  padding: 0;
`

const ToggleNotificationButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  text-decoration: underline;
`

const TripSummaryPane = ({
  from,
  handleTogglePauseMonitoring,
  intl,
  monitoredTrip,
  pendingRequest,
  to
}: Props): JSX.Element => {
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

    return (
      <SavedTripBody>
        <LocationDetails>
          <InvisibleA11yLabel>
            <FormattedMessage
              id="components.SavedTripList.fromTo"
              values={{ from: from?.name, to: to?.name }}
            />
          </InvisibleA11yLabel>
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
            {/* Trip time and duration */}
            <TripDetailWithIcon as="li">
              <Clock />
              <TripSummary monitoredTrip={monitoredTrip} />
            </TripDetailWithIcon>
            {/* Available trip days */}
            <TripDetailWithIcon as="li">
              <Calendar />
              <MonitoredDays days={days} />
            </TripDetailWithIcon>
            {/* Trip notification info */}
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
