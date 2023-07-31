import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import { Map } from '@styled-icons/fa-solid/Map'
import { Print } from '@styled-icons/fa-solid/Print'
import { Times } from '@styled-icons/fa-solid/Times'
// @ts-expect-error not typescripted yet
import PrintableItinerary from '@opentripplanner/printable-itinerary'
import React, { Component } from 'react'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import {
  addPrintViewClassToRootHtml,
  clearClassFromRootHtml
} from '../../util/print'
import { ComponentContext } from '../../util/contexts'
import { getActiveItinerary, getActiveSearch } from '../../util/state'
import { IconWithText } from '../util/styledIcon'
import { summarizeQuery } from '../form/user-settings-i18n'
import DefaultMap from '../map/default-map'
import PageTitle from '../util/page-title'
import SpanWithSpace from '../util/span-with-space'
import TripDetails from '../narrative/connected-trip-details'

type Props = {
  // TODO: Typescript activeSearch type
  activeSearch: any
  // TODO: Typescript config type
  config: any
  currentQuery: any
  intl: IntlShape
  itinerary: Itinerary
  location?: { search?: string }
  parseUrlQueryString: (params?: any, source?: string) => any
  // TODO: Typescript user type
  user: any
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

    // TODO: use currentQuery to pan/zoom to the correct part of the map
  }

  componentWillUnmount() {
    clearClassFromRootHtml()
  }

  render() {
    const { activeSearch, config, intl, itinerary, user } = this.props
    const { LegIcon } = this.context
    const printVerb = intl.formatMessage({ id: 'common.forms.print' })

    return (
      <div className="otp print-layout">
        <PageTitle
          title={[
            printVerb,
            activeSearch &&
              summarizeQuery(activeSearch.query, intl, user.savedLocations)
          ]}
        />
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
            <Button bsSize="small" onClick={this._close} role="link">
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
            {/* FIXME: Improve reframing/setting map bounds when itinerary is received. */}
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
            <TripDetails className="percy-hide" itinerary={itinerary} />
          </>
        )}
      </div>
    )
  }
}

// connect to the redux store

// TODO: Typescript state
const mapStateToProps = (state: any) => {
  const activeSearch = getActiveSearch(state)
  const { localUser, loggedInUser } = state.user
  const user = loggedInUser || localUser
  return {
    activeSearch,
    config: state.otp.config,
    currentQuery: state.otp.currentQuery,
    itinerary: getActiveItinerary(state) as Itinerary,
    user
  }
}

const mapDispatchToProps = {
  parseUrlQueryString: formActions.parseUrlQueryString,
  routingQuery: apiActions.routingQuery
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PrintLayout))
