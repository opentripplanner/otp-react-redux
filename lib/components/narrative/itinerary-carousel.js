import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import SwipeableViews from 'react-swipeable-views'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import Icon from './icon'
import NarrativeItinerary from './narrative-itinerary'
import Loading from './loading'
import { getActiveSearch } from '../../util/state'

class ItineraryCarousel extends Component {
  state = {}
  static propTypes = {
    itineraries: PropTypes.array,
    pending: PropTypes.bool,
    activeItinerary: PropTypes.number,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }
  _onItineraryClick = () => {
    this.setState({expanded: !this.state.expanded})
  }
  _leftClick = () => {
    const newIndex = this.props.activeItinerary === 0 ? this.props.itineraries.length - 1 : this.props.activeItinerary - 1
    this.props.setActiveItinerary(newIndex)
  }
  _rightClick = () => {
    const newIndex = this.props.activeItinerary === this.props.itineraries.length - 1 ? 0 : this.props.activeItinerary + 1
    this.props.setActiveItinerary(newIndex)
  }
  _onSwipe = (index, indexLatest) => {
    this.props.setActiveItinerary(index)
  }
  render () {
    const { itineraries, pending, activeItinerary } = this.props
    if (pending) return <Loading />
    if (!itineraries) return null

    return (
      <div className='options itinerary'>
        <div className='header carousel-header'>
          <Button
            className='carousel-left-button carousel-button'
            disabled={activeItinerary === 0}
            onClick={this._leftClick}>
            <Icon type='arrow-left' />
          </Button>
          <div
            className='text-center carousel-header-text'>
            {activeItinerary + 1} of {itineraries.length}
          </div>
          <Button
            disabled={activeItinerary === itineraries.length - 1}
            className='pull-right carousel-right-button carousel-button'
            onClick={this._rightClick}>
            <Icon type='arrow-right' />
          </Button>
        </div>
        <SwipeableViews
          index={activeItinerary}
          onChangeIndex={this._onSwipe}
        >
          {itineraries.map((itinerary, index) => {
            return (
              <NarrativeItinerary
                itinerary={itinerary}
                index={index}
                key={index}
                expanded={this.state.expanded}
                onClick={this._onItineraryClick}
                {...this.props}
              />
            )
          })}
        </SwipeableViews>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}
  const pending = state.otp.searches.length ? state.otp.searches[state.otp.searches.length - 1].pending : false
  return {
    itineraries: activeSearch && activeSearch.planResponse && activeSearch.planResponse.plan ? activeSearch.planResponse.plan.itineraries : null,
    pending,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setActiveItinerary: (index) => { dispatch(setActiveItinerary({ index })) },
    setActiveLeg: (index, leg) => { dispatch(setActiveLeg({ index, leg })) },
    setActiveStep: (index, step) => { dispatch(setActiveStep({ index, step })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ItineraryCarousel)
