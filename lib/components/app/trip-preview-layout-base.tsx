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
import styled from 'styled-components'

import {
  addPrintViewClassToRootHtml,
  clearClassFromRootHtml
} from '../../util/print'
import { AppConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import { grey } from '../util/colors'
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
  subTitle?: string
  title: string
}

type State = {
  attributionHTML?: string
  mapVisible?: boolean
}

const CustomAttribution = styled.div`
  margin-top: 5px;
  a {
    color: ${grey[700]};
  }
`

const ItineraryContainer = styled.div`
  margin-top: 30px;
`

class TripPreviewLayoutBase extends Component<Props, State> {
  static contextType = ComponentContext

  constructor(props: Props) {
    super(props)
    this.state = {
      attributionHTML: undefined,
      mapVisible: true
    }
  }

  _setInnerHtml = (innerAttributionContent: string) => {
    this.setState({ attributionHTML: innerAttributionContent })
  }

  _toggleMap = () => {
    this.setState({ mapVisible: !this.state.mapVisible })
  }

  _print = () => {
    window.print()
  }

  _updateAttributionContent = () => {
    const innerAttributionContent = this._grabInnerAttributionContent()

    if (
      innerAttributionContent &&
      innerAttributionContent !== this.state.attributionHTML
    ) {
      this.setState({ attributionHTML: innerAttributionContent })
    }
  }

  componentDidMount() {
    // Allow the attribution to fully render before we grab and set the state.
    setTimeout(() => this._updateAttributionContent(), 200)
  }

  componentDidUpdate() {
    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    addPrintViewClassToRootHtml()
    // Sometimes moving the map can change the attribution.
    this._updateAttributionContent()
  }

  componentWillUnmount() {
    clearClassFromRootHtml()
  }

  render() {
    const {
      config,
      header,
      itinerary,
      mapElement,
      onClose,
      subTitle = '',
      title
    } = this.props
    const { LegIcon } = this.context

    const innerAttributionContent = document.querySelector(
      '.maplibregl-ctrl-attrib-inner'
    )?.innerHTML

    if (innerAttributionContent) {
      this._setInnerHtml(innerAttributionContent)
    }

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
          {header}
        </div>

        {/* The map, if visible */}
        {this.state.mapVisible && mapElement}

        {this.state.attributionHTML && this.state.mapVisible && (
          <CustomAttribution
            dangerouslySetInnerHTML={{
              __html: this.state.attributionHTML
            }}
          />
        )}

        {/* The main itinerary body */}
        {itinerary && (
          <ItineraryContainer>
            <PrintableItinerary
              config={config}
              itinerary={itinerary}
              LegIcon={LegIcon}
            />
            <TripDetails className="percy-hide" itinerary={itinerary} />
          </ItineraryContainer>
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
