/* eslint-disable react/require-render-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

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
    setVisibleItinerary: PropTypes.func
  }

  _onHeaderClick = () => {
    const { active, index, onClick, setActiveItinerary } = this.props
    if (onClick) {
      onClick()
    } else if (!active) {
      setActiveItinerary && setActiveItinerary({ index })
    } else {
      setActiveItinerary && setActiveItinerary({ index: null })
    }
  }

  render() {
    throw new Error('render() called on abstract class NarrativeItinerary')
  }
}
