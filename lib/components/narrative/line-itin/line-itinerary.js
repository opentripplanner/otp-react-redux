import React from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import NarrativeItinerary from '../narrative-itinerary'
import SaveTripButton from '../save-trip-button'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'

import ItineraryBody from './connected-itinerary-body'
import ItinerarySummary from './itin-summary'

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
      showRealtimeAnnotation
    } = this.props
    const { ItineraryFooter } = this.context

    if (!itinerary) {
      return <div>No Itinerary!</div>
    }

    return (
      <LineItineraryContainer className="line-itin">
        <ItinerarySummary
          companies={companies}
          itinerary={itinerary}
          onClick={onClick}
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
          />
        ) : null}
        {ItineraryFooter && <ItineraryFooter />}
      </LineItineraryContainer>
    )
  }
}
