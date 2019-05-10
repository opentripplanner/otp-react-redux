import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import SwipeableViews from 'react-swipeable-views'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import Icon from './icon'
import DefaultItinerary from './default/default-itinerary'
import Loading from './loading'
import NarrativeProfileSummary from './narrative-profile-summary'
import { getActiveItineraries, getActiveSearch } from '../../util/state'
import { profileOptionsToItineraries } from '../../util/profile'
import { getTimeFormat } from '../../util/time'

class ItineraryCarousel extends Component {
  state = {}
  static propTypes = {
    itineraries: PropTypes.array,
    pending: PropTypes.bool,
    activeItinerary: PropTypes.number,
    hideHeader: PropTypes.bool,
    itineraryClass: PropTypes.func,
    onClick: PropTypes.func,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    expanded: PropTypes.bool,
    showProfileSummary: PropTypes.bool,
    profileOptions: PropTypes.array,
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
    const { activeItinerary, itineraries, itineraryClass, hideHeader, pending, showProfileSummary } = this.props
    if (pending) return <Loading />
    if (!itineraries) return null

    let views = []
    if (showProfileSummary) {
      views.push(<div style={{ padding: '6px 10px' }}>
        <div style={{ fontSize: '13px', marginBottom: '2px' }}>Your Best Options (Swipe to View All)</div>
        <NarrativeProfileSummary options={this.props.profileOptions} />
      </div>)
    }
    views = views.concat(itineraries.map((itinerary, index) => {
      return React.createElement(itineraryClass, {
        itinerary,
        index,
        key: index,
        expanded: this.props.expanded,
        onClick: this._onItineraryClick,
        ...this.props
      })
    }))

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
  let itineraries = null
  let profileOptions = null
  let showProfileSummary = false
  if (activeSearch && activeSearch.response && activeSearch.response.plan) {
    itineraries = getActiveItineraries(state.otp)
  } else if (activeSearch && activeSearch.response && activeSearch.response.otp) {
    profileOptions = activeSearch.response.otp.profile
    itineraries = profileOptionsToItineraries(profileOptions)
    showProfileSummary = true
  }

  const pending = activeSearch && activeSearch.pending
  return {
    itineraries,
    profileOptions,
    pending,
    showProfileSummary,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    companies: state.otp.currentQuery.companies,
    timeFormat: getTimeFormat(state.otp.config)
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
