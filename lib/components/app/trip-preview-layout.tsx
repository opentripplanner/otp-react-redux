import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { Map } from '@styled-icons/fa-solid/Map'
import { Print } from '@styled-icons/fa-solid/Print'
import { withAuthenticationRequired } from '@auth0/auth0-react'
// @ts-expect-error not typescripted yet
import PrintableItinerary from '@opentripplanner/printable-itinerary'
import React, { Component } from 'react'

import {
  addPrintViewClassToRootHtml,
  clearClassFromRootHtml
} from '../../util/print'
import { AppConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import { IconWithText } from '../util/styledIcon'
import { MonitoredTrip } from '../user/types'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import AwaitingScreen from '../user/awaiting-screen'
import PageTitle from '../util/page-title'
import SimpleMap from '../map/simple-map'
import SpanWithSpace from '../util/span-with-space'
import TripDetails from '../narrative/connected-trip-details'
import withLoggedInUserSupport from '../user/with-logged-in-user-support'

type Props = {
  config: AppConfig
  intl: IntlShape
  tripId: string
}

type State = {
  mapVisible?: boolean
}

class TripPreviewLayout extends Component<Props, State> {
  static contextType = ComponentContext

  constructor(props: Props) {
    super(props)
    this.state = {
      mapVisible: true
    }
  }

  /**
   * Gets the trip to view from the props.
   */
  _getTripToEdit = (): MonitoredTrip => {
    const { monitoredTrips, tripId } = this.props
    return monitoredTrips.find((trip) => trip.id === tripId)
  }

  _toggleMap = () => {
    this.setState({ mapVisible: !this.state.mapVisible })
  }

  _print = () => {
    window.print()
  }

  componentDidUpdate() {
    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    addPrintViewClassToRootHtml()

    // TODO: use currentQuery to pan/zoom to the correct part of the map
  }

  componentWillUnmount() {
    clearClassFromRootHtml()
  }

  render() {
    const { config, intl, monitoredTrips } = this.props
    const { LegIcon } = this.context
    const printVerb = intl.formatMessage({ id: 'common.forms.print' })
    const previewTripText = intl.formatMessage({
      id: 'components.TripPreviewLayout.previewTrip'
    })
    const isAwaiting = !monitoredTrips
    if (isAwaiting) {
      // Flash an indication while the selected and saved user trips are being loaded.
      return <AwaitingScreen />
    }

    const monitoredTrip = this._getTripToEdit()
    const itinerary =
      monitoredTrip.journeyState?.matchingItinerary || monitoredTrip.itinerary

    return (
      <div className="otp print-layout">
        <PageTitle title={[previewTripText, monitoredTrip.tripName]} />
        {/* The header bar, including the Toggle Map and Print buttons */}
        <div className="header">
          <div style={{ float: 'right' }}>
            <SpanWithSpace margin={0.25}>
              <Button
                aria-expanded={this.state.mapVisible}
                bsSize="small"
                onClick={this._toggleMap}
              >
                <IconWithText Icon={Map}>
                  <FormattedMessage id="components.PrintLayout.toggleMap" />
                </IconWithText>
              </Button>
            </SpanWithSpace>
            <SpanWithSpace margin={0.25}>
              <Button bsSize="small" onClick={this._print}>
                <IconWithText Icon={Print}>{printVerb}</IconWithText>
              </Button>
            </SpanWithSpace>
          </div>
          {previewTripText}
        </div>

        {/* The map, if visible */}
        {this.state.mapVisible && (
          <div className="map-container">
            <SimpleMap itinerary={itinerary} />
          </div>
        )}

        {/* The main itinerary body */}
        {itinerary && (
          <>
            <PrintableItinerary
              config={config}
              itinerary={itinerary}
              LegIcon={LegIcon}
            />
            <TripDetails className="percy-hide" itinerary={itinerary} />
          </>
        )}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState, ownProps: Props) => {
  const { loggedInUserMonitoredTrips: monitoredTrips } = state.user
  const tripId = ownProps.match.params.id

  return {
    config: state.otp.config,
    monitoredTrips,
    tripId
  }
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps)(injectIntl(TripPreviewLayout)),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
