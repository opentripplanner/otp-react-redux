import isEqual from 'lodash.isequal'
import { isMobile } from '@opentripplanner/core-utils/lib/ui'
import { connect } from 'react-redux'
import { MapLayer, withLeaflet } from 'react-leaflet'

import {
  getItineraryBounds,
  getLegBounds
} from '../../util/itinerary'
import { getActiveItinerary, getActiveSearch } from '../../util/state'

class BoundsUpdatingOverlay extends MapLayer {
  createLeafletElement () {}

  updateLeafletElement () {}

  componentDidMount () {
    this.updateBounds(null, this.props)
  }

  componentDidUpdate (prevProps) {
    this.updateBounds(prevProps, this.props)
  }

  componentWillUnmount () {}

  /* eslint-disable-next-line complexity */
  updateBounds (oldProps, newProps) {
    // TODO: maybe setting bounds ought to be handled in map props...

    oldProps = oldProps || {}
    newProps = newProps || {}

    // Don't auto-fit if popup us active
    if (oldProps.popupLocation || newProps.popupLocation) return

    const { map } = newProps.leaflet
    if (!map) return

    const padding = [30, 30]

    // Fit map to to entire itinerary if active itinerary bounds changed
    const oldItinBounds = oldProps.itinerary && getItineraryBounds(oldProps.itinerary)
    const fromChanged = !isEqual(oldProps.query && oldProps.query.from, newProps.query && newProps.query.from)
    const toChanged = !isEqual(oldProps.query && oldProps.query.to, newProps.query && newProps.query.to)
    const newItinBounds = newProps.itinerary && getItineraryBounds(newProps.itinerary)
    if (
      (!oldItinBounds && newItinBounds) ||
      (oldItinBounds && newItinBounds && !oldItinBounds.equals(newItinBounds))
    ) {
      map.fitBounds(newItinBounds, { padding })
    // Pan to to itinerary leg if made active (clicked); newly active leg must be non-null
    } else if (newProps.itinerary && newProps.activeLeg !== oldProps.activeLeg && newProps.activeLeg !== null) {
      map.fitBounds(
        getLegBounds(newProps.itinerary.legs[newProps.activeLeg]),
        { padding }
      )

    // If no itinerary update but from/to locations are present, fit to those
    } else if (newProps.query.from && newProps.query.to && (fromChanged || toChanged)) {
      // On certain mobile devices (e.g., Android + Chrome), setting from and to
      // locations via the location search component causes issues for this
      // fitBounds invocation. The map does not appear to be visible when these
      // prop changes are detected, so for now we should perhaps just skip this
      // fitBounds on mobile.
      // See https://github.com/opentripplanner/otp-react-redux/issues/133 for
      // more info.
      // TODO: Fix this so mobile devices will also update the bounds to the
      // from/to locations.
      if (!isMobile()) {
        map.fitBounds([
          [newProps.query.from.lat, newProps.query.from.lon],
          [newProps.query.to.lat, newProps.query.to.lon]
        ], { padding })
      }

    // If only from or to is set, pan to that
    } else if (newProps.query.from && fromChanged) {
      map.panTo([newProps.query.from.lat, newProps.query.from.lon])
    } else if (newProps.query.to && toChanged) {
      map.panTo([newProps.query.to.lat, newProps.query.to.lon])

    // Pan to to itinerary step if made active (clicked)
    } else if (
      newProps.itinerary &&
      newProps.activeLeg !== null &&
      newProps.activeStep !== null &&
      newProps.activeStep !== oldProps.activeStep
    ) {
      const leg = newProps.itinerary.legs[newProps.activeLeg]
      const step = leg.steps[newProps.activeStep]
      map.panTo([step.lat, step.lon])
    }
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    itinerary: getActiveItinerary(state.otp),
    popupLocation: state.otp.ui.mapPopupLocation,
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = {}

export default withLeaflet(
  connect(mapStateToProps, mapDispatchToProps)(BoundsUpdatingOverlay)
)
