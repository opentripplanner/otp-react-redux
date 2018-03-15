import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Loading from './loading'
import NarrativeItineraries from './narrative-itineraries'
import NarrativeProfileOptions from './narrative-profile-options'
import TabbedItineraries from './tabbed-itineraries'

import { getActiveSearch } from '../../util/state'

class NarrativeRoutingResults extends Component {
  static propTypes = {
    customIcons: PropTypes.object,
    itineraryClass: PropTypes.func,
    routingType: PropTypes.string
  }

  render () {
    const { customIcons, itineraryClass, pending, routingType } = this.props
    if (pending) return <Loading />

    return (
      routingType === 'ITINERARY'
        ? <TabbedItineraries itineraryClass={itineraryClass} />
        : <NarrativeProfileOptions
          itineraryClass={itineraryClass}
          customIcons={customIcons}
        />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)

  return {
    pending: activeSearch && activeSearch.pending,
    routingType: activeSearch && activeSearch.query.routingType
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(NarrativeRoutingResults)
