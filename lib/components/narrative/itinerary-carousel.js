import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import SwipeableViews from 'react-swipeable-views'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import { ComponentContext } from '../../util/contexts'
import { getActiveItineraries, getActiveSearch } from '../../util/state'
import Icon from '../util/icon'

import Loading from './loading'

class ItineraryCarousel extends Component {
  state = {}
  static propTypes = {
    activeItinerary: PropTypes.number,
    companies: PropTypes.string,
    expanded: PropTypes.bool,
    hideHeader: PropTypes.bool,
    itineraries: PropTypes.array,
    onClick: PropTypes.func,
    pending: PropTypes.number,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  static contextType = ComponentContext

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
    const {
      activeItinerary,
      expanded,
      hideHeader,
      itineraries,
      pending
    } = this.props
    const { ItineraryBody, LegIcon } = this.context

    if (pending) return <Loading small />
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
              className='pull-right carousel-right-button carousel-button'
              disabled={activeItinerary === itineraries.length - 1}
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
            const active = index === activeItinerary
            return (
              <ItineraryBody
                active={active}
                expanded={expanded}
                index={index}
                itinerary={itinerary}
                key={index}
                LegIcon={LegIcon}
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
  const activeSearch = getActiveSearch(state)
  const itineraries = getActiveItineraries(state)

  return {
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    companies: state.otp.currentQuery.companies,
    itineraries,
    pending: activeSearch && activeSearch.pending,
    timeFormat: coreUtils.time.getTimeFormat(state.otp.config)
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
