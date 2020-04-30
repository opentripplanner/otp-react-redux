import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Loading from './loading'
import TabbedItineraries from './tabbed-itineraries'
import ErrorMessage from '../form/error-message'

import { getActiveSearch, getActiveItineraries } from '../../util/state'
import { setMainPanelContent } from '../../actions/ui'

class NarrativeRoutingResults extends Component {
  static propTypes = {
    itineraryClass: PropTypes.func,
    LegIcon: PropTypes.elementType.isRequired,
    routingType: PropTypes.string
  }

  componentDidUpdate (prevProps) {
    if ((!prevProps.itineraries || prevProps.itineraries.length === 0) &&
        (this.props.itineraries && this.props.itineraries.length > 0)) {
      this.props.setMainPanelContent(null)
    }
    if (!prevProps.error && this.props.error) this.props.setMainPanelContent(null)
  }

  render () {
    const { error, itineraryClass, itineraryFooter, LegIcon, pending, itineraries, mainPanelContent } = this.props
    if (pending) return <Loading />
    if (error) return <ErrorMessage />
    if (mainPanelContent) return null

    return (
      // TODO: If multiple routing types exist, do the check here.
      <TabbedItineraries
        itineraryClass={itineraryClass}
        itineraryFooter={itineraryFooter}
        itineraries={itineraries}
        LegIcon={LegIcon}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    mainPanelContent: state.otp.ui.mainPanelContent,
    error: activeSearch && activeSearch.response && activeSearch.response.error,
    itineraries: getActiveItineraries(state.otp),
    pending: activeSearch && activeSearch.pending,
    routingType: activeSearch && activeSearch.query.routingType
  }
}

const mapDispatchToProps = {
  setMainPanelContent
}

export default connect(mapStateToProps, mapDispatchToProps)(NarrativeRoutingResults)
