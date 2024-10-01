import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { useIntl } from 'react-intl'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../util/state-types'
import { MonitoredTrip } from '../user/types'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import SimpleMap from '../map/simple-map'
import withLoggedInUserSupport from '../user/with-logged-in-user-support'

import TripPreviewLayoutBase from './trip-preview-layout-base'

type Props = {
  monitoredTrip?: MonitoredTrip
}

const MapContainer = styled.div`
  height: 100%;
  width: 100%;

  .map {
    height: 100%;
    width: 100%;
  }
`

const TripPreviewLayout = ({ monitoredTrip }: Props) => {
  const intl = useIntl()
  const previewTripText = intl.formatMessage({
    id: 'components.TripPreviewLayout.previewTrip'
  })
  const itinerary =
    monitoredTrip?.journeyState?.matchingItinerary || monitoredTrip?.itinerary

  return (
    <TripPreviewLayoutBase
      header={previewTripText}
      itinerary={itinerary}
      mapElement={
        itinerary && (
          <MapContainer className="map-container percy-hide">
            <SimpleMap itinerary={itinerary} />
          </MapContainer>
        )
      }
      subTitle={monitoredTrip?.tripName}
      title={previewTripText}
    />
  )
}

// connect to the redux store

const mapStateToProps = (
  state: AppReduxState,
  ownProps: Props & RouteComponentProps<{ id: string }>
) => {
  const { loggedInUserMonitoredTrips: trips } = state.user
  const tripId = ownProps.match.params.id

  return {
    monitoredTrip: trips?.find((trip) => trip.id === tripId)
  }
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps)(TripPreviewLayout),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
