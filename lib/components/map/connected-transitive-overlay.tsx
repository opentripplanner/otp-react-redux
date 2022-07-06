import { Company, Itinerary, Leg } from '@opentripplanner/types'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React from 'react'
import TransitiveCanvasOverlay, {
  itineraryToTransitive
  // @ts-expect-error transitive-overlay is not typescripted
} from '@opentripplanner/transitive-overlay'

import { getTransitiveData } from '../../util/state'

type ItineraryData = {
  companies?: Company[]
  disableFlexArc: boolean
  getTransitiveRouteLabel: (leg: Leg) => string
  hasItineraryResponse: boolean
  hasResponse: boolean
  itineraryToRender: Itinerary
  otpResponse: unknown
}

type Props = {
  itineraryData: ItineraryData
  labeledModes: string[]
  styles: {
    labels: Record<string, unknown>
    segmentLabels: Record<string, unknown>
  }
}

const ConnectedTransitiveOverlay = (props: Props) => {
  const { itineraryData, labeledModes, styles } = props
  const intl = useIntl()
  if (!itineraryData) return null
  const {
    companies,
    disableFlexArc,
    getTransitiveRouteLabel,
    hasItineraryResponse,
    hasResponse,
    itineraryToRender,
    otpResponse
  } = itineraryData

  let transitiveData
  if (hasResponse) {
    if (hasItineraryResponse) {
      transitiveData = itineraryToRender
        ? itineraryToTransitive(itineraryToRender, {
            companies,
            disableFlexArc,
            getTransitiveRouteLabel,
            intl
          })
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

  // @ts-expect-error state.js is not typescripted
  const itineraryData: ItineraryData = getTransitiveData(state, ownProps)

  const obj = {
    itineraryData,
    labeledModes,
    styles
  } // generate implicit type
  return obj
}

export default connect(mapStateToProps)(ConnectedTransitiveOverlay)
