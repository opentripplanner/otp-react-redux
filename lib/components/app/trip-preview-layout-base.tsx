import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import { Map } from '@styled-icons/fa-solid/Map'
import { Print } from '@styled-icons/fa-solid/Print'
import { Times } from '@styled-icons/fa-solid/Times'
// @ts-expect-error not typescripted yet
import PrintableItinerary from '@opentripplanner/printable-itinerary'
import React, { Component, ReactNode } from 'react'

import {
  addPrintViewClassToRootHtml,
  clearClassFromRootHtml
} from '../../util/print'
import { AppConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import { IconWithText } from '../util/styledIcon'
import PageTitle from '../util/page-title'
import SpanWithSpace from '../util/span-with-space'
import TripDetails from '../narrative/connected-trip-details'

type Props = {
  config: AppConfig
  header?: ReactNode
  itinerary?: Itinerary
  mapElement?: ReactNode
  onClose?: () => void
  subTitle: string
  title: string
}

type State = {
  mapVisible?: boolean
}

class TripPreviewLayoutBase extends Component<Props, State> {
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

  componentDidUpdate() {
    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    addPrintViewClassToRootHtml()
  }

  componentWillUnmount() {
    clearClassFromRootHtml()
  }

  render() {
    const { config, itinerary, mapElement, onClose, subTitle, title } =
      this.props
    const { LegIcon } = this.context

    return (
      <div className="otp print-layout">
        <PageTitle title={[title, subTitle]} />
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
                <IconWithText Icon={Print}>
                  <FormattedMessage id="common.forms.print" />
                </IconWithText>
              </Button>
            </SpanWithSpace>
            {onClose && (
              <Button bsSize="small" onClick={onClose} role="link">
                <IconWithText Icon={Times}>
                  <FormattedMessage id="common.forms.close" />
                </IconWithText>
              </Button>
            )}
          </div>
          {title}
        </div>

        {/* The map, if visible */}
        {this.state.mapVisible && mapElement}

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

const mapStateToProps = (state: AppReduxState) => ({
  config: state.otp.config
})

export default connect(mapStateToProps)(TripPreviewLayoutBase)
