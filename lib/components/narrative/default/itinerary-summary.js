import { getCompanyFromLeg } from '@opentripplanner/core-utils/lib/itinerary'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

// FIXME: Some of these must be marked !important, otherwise the summary-block
// mode-block css class selectors will take precedence.
const Block = styled.div`
  background-color: ${props => getModeColor(props.mode)};
  height: 24px!important;
  margin: 0px!important;
  padding: 3px!important;
  width: 24px!important;
  :first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  :last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`

const modeColors = {
  BICYCLE: '#E0C3E2',
  BUS: '#CAC3DF',
  CAR: '#E4CCCC',
  PARK: '#E4CCCC',
  RAIL: '#BDDAC0',
  WALK: '#DFC486'
}
const DEFAULT_COLOR = 'grey'

function getModeColor (mode) {
  if (!mode) return DEFAULT_COLOR
  let color = modeColors[mode.toUpperCase()]
  if (typeof color === 'undefined') color = DEFAULT_COLOR
  return color
}

export default class ItinerarySummary extends Component {
  static propTypes = {
    itinerary: PropTypes.object,
    LegIcon: PropTypes.elementType.isRequired
  }

  render () {
    const { itinerary, LegIcon } = this.props

    const blocks = []
    itinerary.legs.forEach((leg, i) => {
      // Skip mid-itinerary walk transfer legs
      if (
        i > 0 &&
        i < itinerary.legs.length - 1 &&
        !leg.transitLeg &&
        itinerary.legs[i - 1].transitLeg &&
        itinerary.legs[i + 1].transitLeg) {
        return null
      }

      // Add the mode icon
      let title = leg.mode
      if (leg.transitLeg) {
        title = leg.routeShortName
          ? `${leg.routeShortName}${leg.routeLongName ? ` - ${leg.routeLongName}` : ''}`
          : leg.routeLongName
      }
      const company = getCompanyFromLeg(leg)
      let iconStyle
      // FIXME: hack for HOPR company logo, which must be offset a few pixels
      // to look good.
      if (company && company.toLowerCase() === 'hopr') {
        iconStyle = {marginTop: '-5px'}
      }
      blocks.push(
        <Block
          className='summary-block mode-block'
          key={blocks.length}
          mode={leg.mode}
          title={title}
        >
          <LegIcon leg={leg} style={iconStyle} />
        </Block>
      )
    })

    return <div className='summary'>{blocks}</div>
  }
}
