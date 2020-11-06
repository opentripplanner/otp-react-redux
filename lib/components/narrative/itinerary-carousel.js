import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import SwipeableViews from 'react-swipeable-views'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import Icon from './icon'
import DefaultItinerary from './default/default-itinerary'
import Loading from './loading'
import { getActiveItineraries, getActiveSearch } from '../../util/state'

class ItineraryCarousel extends Component {
  state = {}
  static propTypes = {
    itineraries: PropTypes.array,
    pending: PropTypes.number,
    activeItinerary: PropTypes.number,
    hideHeader: PropTypes.bool,
    itineraryClass: PropTypes.func,
    onClick: PropTypes.func,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    expanded: PropTypes.bool,
    companies: PropTypes.string
  }

  static defaultProps = {
    itineraryClass: DefaultItinerary
  }

  _onItineraryClick = () => {
    if (typeof this.props.onClick === 'function') this.props.onClick()
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
    const { activeItinerary, itineraries, itineraryClass, hideHeader, pending, user } = this.props
    if (pending) return <Loading small />
    if (!itineraries) return null

    const views = itineraries.map((itinerary, index) => {
      return React.createElement(itineraryClass, {
        itinerary,
        index,
        key: index,
        expanded: this.props.expanded,
        onClick: this._onItineraryClick,
        user,
        ...this.props
      })
    })

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
        >{views}</SwipeableViews>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const itineraries = getActiveItineraries(state.otp)

  return {
    itineraries,
    pending: activeSearch && activeSearch.pending,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    companies: state.otp.currentQuery.companies,
    timeFormat: coreUtils.time.getTimeFormat(state.otp.config),
    user: state.user.loggedInUser
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
