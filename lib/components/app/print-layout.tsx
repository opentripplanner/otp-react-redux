import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
// @ts-expect-error not typescripted yet
import PrintableItinerary from '@opentripplanner/printable-itinerary'
import React, { Component } from 'react'

import {
  addPrintViewClassToRootHtml,
  clearClassFromRootHtml
} from '../../util/print'
import { ComponentContext } from '../../util/contexts'
import { getActiveItinerary } from '../../util/state'
import { parseUrlQueryString } from '../../actions/form'
import { routingQuery } from '../../actions/api'
import { setMapCenter } from '../../actions/config'
import DefaultMap from '../map/default-map'
import Icon from '../util/icon'
import SpanWithSpace from '../util/span-with-space'
import TripDetails from '../narrative/connected-trip-details'

type Props = {
  // TODO: Typescript config type
  config: any
  currentQuery: any
  // TODO: typescript state.js
  itinerary: any
  location?: { search?: string }
  parseUrlQueryString: (params?: any, source?: string) => any
  setMapCenter: ({ lat, lon }: { lat: number; lon: number }) => void
}

type State = {
  mapVisible?: boolean
}

class PrintLayout extends Component<Props, State> {
  static contextType = ComponentContext

  constructor(props: Props) {
    super(props)
    this.state = {
      mapVisible: true
    }
  }

  _toggleMap = () => {
    this.setState({ mapVisible: !this.state.mapVisible })
  }

  _print = () => {
    window.print()
  }

  _close = () => {
    window.location.replace(String(window.location).replace('print/', ''))
  }

  componentDidMount() {
    const {
      currentQuery,
      itinerary,
      location,
      parseUrlQueryString,
      setMapCenter
    } = this.props
    // TODO: this is an annoying hack. Ideally we wouldn't wipe out initLat and initLon
    // TODO: is there a way to adjust transitiveData to force the transitive overlay to re-adjust bounds?
    const { lat, lon } = currentQuery.from

    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    addPrintViewClassToRootHtml()
    // Parse the URL query parameters, if present
    if (!itinerary && location && location.search) {
      parseUrlQueryString()
    }

    setMapCenter({ lat, lon })
  }

  componentWillUnmount() {
    clearClassFromRootHtml()
  }

  render() {
    const { config, itinerary } = this.props
    const { LegIcon } = this.context

    return (
      <div className="otp print-layout">
        {/* The header bar, including the Toggle Map and Print buttons */}
        <div className="header">
          <div style={{ float: 'right' }}>
            <SpanWithSpace margin={0.25}>
              <Button bsSize="small" onClick={this._toggleMap}>
                <Icon type="map" withSpace />
                <FormattedMessage id="components.PrintLayout.toggleMap" />
              </Button>
            </SpanWithSpace>
            <SpanWithSpace margin={0.25}>
              <Button bsSize="small" onClick={this._print}>
                <Icon type="print" withSpace />
                <FormattedMessage id="common.forms.print" />
              </Button>
            </SpanWithSpace>
            <Button bsSize="small" onClick={this._close}>
              <Icon type="close" withSpace />
              <FormattedMessage id="common.forms.close" />
            </Button>
          </div>
          <FormattedMessage id="components.PrintLayout.itinerary" />
        </div>

        {/* The map, if visible */}
        {this.state.mapVisible && (
          <div className="map-container">
            <DefaultMap />
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
            <TripDetails itinerary={itinerary} />
          </>
        )}
      </div>
    )
  }
}

// connect to the redux store

// TODO: Typescript state
const mapStateToProps = (state: any) => {
  return {
    config: state.otp.config,
    currentQuery: state.otp.currentQuery,
    itinerary: getActiveItinerary(state)
  }
}

const mapDispatchToProps = {
  parseUrlQueryString,
  routingQuery,
  setMapCenter
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintLayout)
