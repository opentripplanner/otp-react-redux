import { Company, Itinerary, Leg } from '@opentripplanner/types'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React from 'react'
import TransitiveCanvasOverlay, {
  itineraryToTransitive
  // @ts-expect-error transitive-overlay is not typescripted
} from '@opentripplanner/transitive-overlay'

import { getTransitiveData } from '../../util/state'

type Props = {
  itineraryData: {
    companies: Company[]
    disableFlexArc: boolean
    getTransitiveRouteLabel: (leg: Leg) => string
    hasItineraryResponse: boolean
    hasResponse: boolean
    itineraryToRender: Itinerary
    otpResponse: unknown
  }
  labeledModes: string[]
  styles: {
    labels: Record<string, unknown>
    segmentLabels: Record<string, unknown>
  }
}

const ConnectedTransitiveOverlay = (props: Props) => {
  const { itineraryData, labeledModes, styles } = props
  const {
    companies,
    disableFlexArc,
    getTransitiveRouteLabel,
    hasItineraryResponse,
    hasResponse,
    itineraryToRender,
    otpResponse
  } = itineraryData

  const intl = useIntl()

  let transitiveData
  if (hasResponse) {
    if (hasItineraryResponse) {
      transitiveData = itineraryToRender
        ? itineraryToTransitive(
            itineraryToRender,
            companies,
            getTransitiveRouteLabel,
            disableFlexArc,
            intl
          )
        : null
    } else if (otpResponse) {
      transitiveData = otpResponse
    }
  }
  return (
    <TransitiveCanvasOverlay
      labeledModes={labeledModes}
      styles={styles}
      transitiveData={transitiveData}
    />
  )
}

// connect to the redux store
const mapStateToProps = (state: Record<string, any>, ownProps: Props) => {
  const { labeledModes, styles } = state.otp.config.map.transitive || {}
  const { viewedRoute } = state.otp.ui

  // If the route viewer is active, do not show itinerary on map.
  // mainPanelContent is null whenever the trip planner is active.
  // Some views like the stop viewer can be accessed via the trip planner
  // or the route viewer, so include a route being viewed as a condition
  // for hiding
  if (state.otp.ui.mainPanelContent !== null && viewedRoute) {
    return {}
  }

  const transitiveData: {
    companies: Company[]
    disableFlexArc: boolean
    getTransitiveRouteLabel: (leg: Leg) => string
    hasItineraryResponse: boolean
    hasResponse: boolean
    itineraryToRender: Itinerary
    otpResponse: unknown
    // @ts-expect-error state.js is not typescripted
  } = getTransitiveData(state, ownProps)

  const obj = {
    itineraryData: transitiveData,
    labeledModes,
    styles
  } // generate implicit type
  return obj
}

export default connect(mapStateToProps)(ConnectedTransitiveOverlay)
