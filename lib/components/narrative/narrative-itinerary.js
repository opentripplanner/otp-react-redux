/* eslint-disable react/require-render-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class NarrativeItinerary extends Component {
  static propTypes = {
    active: PropTypes.bool,
    activeLeg: PropTypes.number,
    activeStep: PropTypes.number,
    expanded: PropTypes.bool,
    index: PropTypes.number,
    itinerary: PropTypes.object,
    onClick: PropTypes.func,
    routingType: PropTypes.string,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    setVisibleItinerary: PropTypes.func,
    toggleDetailedItinerary: PropTypes.func
  }

  __setItinToActiveIndex = () => {
    const { index, setActiveItinerary, setVisibleItinerary } = this.props
    setActiveItinerary && setActiveItinerary({ index })
    setVisibleItinerary && setVisibleItinerary({ index })
  }

  _onDirectClick = () => {
    const { toggleDetailedItinerary } = this.props
    this.__setItinToActiveIndex()
    toggleDetailedItinerary()
  }

  _onHeaderClick = () => {
    const { active, onClick, setActiveItinerary } = this.props
    if (onClick) {
      onClick()
    } else if (!active) {
      this.__setItinToActiveIndex()
    } else {
      setActiveItinerary && setActiveItinerary({ index: null })
    }
  }

  render() {
    throw new Error('render() called on abstract class NarrativeItinerary')
  }
}
