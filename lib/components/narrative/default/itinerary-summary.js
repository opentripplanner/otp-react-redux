/* eslint-disable @typescript-eslint/no-use-before-define */

import { connect } from 'react-redux'
import { getCompanyFromLeg } from '@opentripplanner/core-utils/lib/itinerary'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'

const mapStateToProps = (state, ownProps) => {
  return {
    fillModeIcons: state.otp.config.itinerary?.fillModeIcons,
    renderRouteNamesAndColors:
      state.otp.config.itinerary?.renderRouteNamesInBlocks
  }
}
// FIXME: Some of these must be marked !important, otherwise the summary-block
// mode-block css class selectors will take precedence.
const Block = connect(mapStateToProps)(styled.div`
  background-color: ${(props) =>
    props.renderRouteNamesAndColors && props.routeColor
      ? `#${props.routeColor}`
      : getModeColor(props.mode)};
  color: ${(props) =>
    props.renderRouteNamesAndColors && props.routeTextColor
      ? `#${props.routeTextColor}`
      : 'inherit'};
  fill: ${(props) =>
    props.renderRouteNamesAndColors &&
    props.fillModeIcons &&
    props.routeTextColor
      ? `#${props.routeTextColor}`
      : 'inherit'};
  height: 24px !important;
  margin: 0px !important;
  padding: 3px !important;
  width: auto !important;
  display: inline-flex !important;
  align-items: normal;
  gap: 2px;
  :first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  :last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  span {
    display: ${(props) => (props.renderRouteNamesAndColors ? 'block' : 'none')};
    align-self: center;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`)

const modeColors = {
  BICYCLE: '#E0C3E2',
  BUS: '#CAC3DF',
  CAR: '#E4CCCC',
  PARK: '#E4CCCC',
  RAIL: '#BDDAC0',
  WALK: '#DFC486'
}
const DEFAULT_COLOR = '#c49494'

function getModeColor(mode) {
  if (!mode) return DEFAULT_COLOR
  let color = modeColors[mode.toUpperCase()]
  if (typeof color === 'undefined') color = DEFAULT_COLOR
  return color
}

export default class ItinerarySummary extends Component {
  static contextType = ComponentContext
  static propTypes = {
    itinerary: PropTypes.object,
    LegIcon: PropTypes.elementType.isRequired
  }

  render() {
    const { getTransitiveRouteLabel } = this.context
    const { itinerary, LegIcon } = this.props

    const blocks = []
    itinerary.legs.forEach((leg, i) => {
      // Skip mid-itinerary walk transfer legs
      if (
        i > 0 &&
        i < itinerary.legs.length - 1 &&
        !leg.transitLeg &&
        itinerary.legs[i - 1].transitLeg &&
        itinerary.legs[i + 1].transitLeg
      ) {
        return null
      }

      // Add the mode icon
      let title = leg.mode
      if (leg.transitLeg) {
        title = leg.routeShortName
          ? `${leg.routeShortName}${
              leg.routeLongName ? ` - ${leg.routeLongName}` : ''
            }`
          : leg.routeLongName
      }
      const company = getCompanyFromLeg(leg)
      let iconStyle
      // FIXME: hack for HOPR company logo, which must be offset a few pixels
      // to look good.
      if (company && company.toLowerCase() === 'hopr') {
        iconStyle = { marginTop: '-5px' }
      }
      blocks.push(
        <Block
          className="summary-block mode-block"
          key={blocks.length}
          mode={leg.mode}
          routeColor={leg.routeColor}
          routeTextColor={leg.routeTextColor}
          title={title}
        >
          <LegIcon leg={leg} style={iconStyle} />
          <span>{getTransitiveRouteLabel(leg)}</span>
        </Block>
      )
    })

    return <div className="summary">{blocks}</div>
  }
}
