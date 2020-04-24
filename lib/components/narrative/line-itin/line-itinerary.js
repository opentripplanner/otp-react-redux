import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import styled from 'styled-components'

import ItineraryBody from './connected-itinerary-body'
import ItinerarySummary from './itin-summary'
import NarrativeItinerary from '../narrative-itinerary'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'

const { getLegModeLabel, getTimeZoneOffset, isTransit } = coreUtils.itinerary

export const LineItineraryContainer = styled.div`
  margin-bottom: 20px;
`

export default class LineItinerary extends NarrativeItinerary {
  _headerText () {
    const { itinerary } = this.props
    return itinerary.summary || this._getSummary(itinerary)
  }

  _getSummary (itinerary) {
    let summary = ''
    let transitModes = []
    itinerary.legs.forEach((leg, index) => {
      if (isTransit(leg.mode)) {
        const modeStr = getLegModeLabel(leg)
        if (transitModes.indexOf(modeStr) === -1) transitModes.push(modeStr)
      }
    })

    // check for access mode
    if (!isTransit(itinerary.legs[0].mode)) {
      summary += getLegModeLabel(itinerary.legs[0])
    }

    // append transit modes, if applicable
    if (transitModes.length > 0) {
      summary += ' to ' + transitModes.join(', ')
    }

    return summary
  }

  render () {
    const {
      active,
      companies,
      customIcons,
      expanded,
      itinerary,
      itineraryFooter,
      showRealtimeAnnotation,
      onClick,
      timeFormat
    } = this.props

    if (!itinerary) {
      return <div>No Itinerary!</div>
    }

    const timeOptions = {
      format: timeFormat,
      offset: getTimeZoneOffset(itinerary)
    }

    return (
      <LineItineraryContainer>
        <ItinerarySummary
          companies={companies}
          itinerary={itinerary}
          timeOptions={timeOptions}
          onClick={onClick}
          customIcons={customIcons} />
        {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
        {active || expanded
          ? <ItineraryBody itinerary={itinerary} />
          : null}
        {itineraryFooter}
      </LineItineraryContainer>
    )
  }
}
