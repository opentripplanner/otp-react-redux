import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import SwipeableViews from 'react-swipeable-views'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import Icon from './icon'
import DefaultItinerary from './default/default-itinerary'
import Loading from './loading'
import { getActiveSearch } from '../../util/state'

class ItineraryCarousel extends Component {
  state = {}
  static propTypes = {
    itineraries: PropTypes.array,
    pending: PropTypes.bool,
    activeItinerary: PropTypes.number,
    hideHeader: PropTypes.bool,
    itineraryClass: PropTypes.func,
    onExpand: PropTypes.func,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  static defaultProps = {
    itineraryClass: DefaultItinerary
  }

  _onItineraryClick = () => {
    const expanded = !this.state.expanded
    this.setState({expanded})
    if (this.props.onExpand) this.props.onExpand(expanded)
  }

  _onLeftClick = () => {
    const { activeItinerary, itineraries, setActiveItinerary } = this.props
    setActiveItinerary(activeItinerary === 0 ? itineraries.length - 1 : activeItinerary - 1)
  }

  _onRightClick = () => {
    const { activeItinerary, itineraries, setActiveItinerary } = this.props
    setActiveItinerary(activeItinerary === itineraries.length - 1 ? 0 : activeItinerary + 1)
  }

  _onSwipe = (index, indexLatest) => {
    this.props.setActiveItinerary(index)
  }

  render () {
    const { activeItinerary, itineraries, itineraryClass, hideHeader, pending } = this.props
    if (pending) return <Loading />
    if (!itineraries) return null

    return (
      <div className='options itinerary'>
        {hideHeader
          ? null
          : <div className='header carousel-header'>
            <Button
              className='carousel-left-button carousel-button'
              disabled={activeItinerary === 0}
              onClick={this._onLeftClick}>
              <Icon type='arrow-left' />
            </Button>
            <div
              className='text-center carousel-header-text'>
              {activeItinerary + 1} of {itineraries.length}
            </div>
            <Button
              disabled={activeItinerary === itineraries.length - 1}
              className='pull-right carousel-right-button carousel-button'
              onClick={this._onRightClick}>
              <Icon type='arrow-right' />
            </Button>
          </div>
        }
        <SwipeableViews
          index={activeItinerary}
          onChangeIndex={this._onSwipe}
        >
          {itineraries.map((itinerary, index) => {
            return React.createElement(itineraryClass, {
              itinerary,
              index,
              key: index,
              expanded: this.state.expanded,
              onClick: this._onItineraryClick,
              ...this.props
            })
          })}
        </SwipeableViews>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
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
