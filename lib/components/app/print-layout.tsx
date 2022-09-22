import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Map } from '@styled-icons/fa-solid/Map'
import { Print } from '@styled-icons/fa-solid/Print'
import { Times } from '@styled-icons/fa-solid/Times'
// @ts-expect-error not typescripted yet
import PrintableItinerary from '@opentripplanner/printable-itinerary'
import React, { Component } from 'react'

import {
  addPrintViewClassToRootHtml,
  clearClassFromRootHtml
} from '../../util/print'
import { ComponentContext } from '../../util/contexts'
import { getActiveItinerary } from '../../util/state'
import { IconWithText } from '../util/styledIcon'
import { parseUrlQueryString } from '../../actions/form'
import { routingQuery } from '../../actions/api'
import DefaultMap from '../map/default-map'
import SpanWithSpace from '../util/span-with-space'
import TripDetails from '../narrative/connected-trip-details'

type Props = {
  // TODO: Typescript config type
  config: any
  // TODO: typescript state.js
  itinerary: any
  location?: { search?: string }
  parseUrlQueryString: (params?: any, source?: string) => any
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
    const { itinerary, location, parseUrlQueryString } = this.props
    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    addPrintViewClassToRootHtml()
    // Parse the URL query parameters, if present
    if (!itinerary && location && location.search) {
      parseUrlQueryString()
    }
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
                <IconWithText Icon={Map}>
                  <FormattedMessage id="components.PrintLayout.toggleMap" />
                </IconWithText>
              </Button>
            </SpanWithSpace>
            <SpanWithSpace margin={0.25}>
              <Button bsSize="small" onClick={this._print}>
                <IconWithText Icon={Print}>
                  <FormattedMessage id="common.forms.print" />
                </IconWithText>
              </Button>
            </SpanWithSpace>
            <Button bsSize="small" onClick={this._close}>
              <IconWithText Icon={Times}>
                <FormattedMessage id="common.forms.close" />
              </IconWithText>
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
    itinerary: getActiveItinerary(state)
  }
}

const mapDispatchToProps = {
  parseUrlQueryString,
  routingQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintLayout)
