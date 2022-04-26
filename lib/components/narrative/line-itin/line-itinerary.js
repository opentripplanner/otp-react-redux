import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import NarrativeItinerary from '../narrative-itinerary'
import SaveTripButton from '../save-trip-button'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'

import ItineraryBody from './connected-itinerary-body'
import ItinerarySummary from './itin-summary'

const { getTimeZoneOffset } = coreUtils.itinerary

export const LineItineraryContainer = styled.div`
  margin-bottom: 20px;
`

export default class LineItinerary extends NarrativeItinerary {
  static contextType = ComponentContext

  render() {
    const {
      active,
      companies,
      expanded,
      itinerary,
      onClick,
      setActiveLeg,
      showRealtimeAnnotation,
      timeFormat
    } = this.props
    const { ItineraryFooter } = this.context

    if (!itinerary) {
      return <div>No Itinerary!</div>
    }

    const timeOptions = {
      format: timeFormat,
      offset: getTimeZoneOffset(itinerary)
    }

    return (
      <LineItineraryContainer className="line-itin">
        <ItinerarySummary
          companies={companies}
          itinerary={itinerary}
          onClick={onClick}
          timeOptions={timeOptions}
        />

        <SaveTripButton />

        {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
        {active || expanded ? (
          <ItineraryBody
            itinerary={itinerary}
            // Don't use setActiveLeg as an import
            // (will cause error when clicking on itinerary summary).
            // Use the one passed by NarrativeItineraries instead.
            setActiveLeg={setActiveLeg}
            timeOptions={timeOptions}
          />
        ) : null}
        {ItineraryFooter && <ItineraryFooter />}
      </LineItineraryContainer>
    )
  }
}
