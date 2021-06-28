import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { connect } from 'react-redux'

import {
  setActiveItinerary,
  setActiveLeg,
  setActiveStep,
  setUseRealtimeResponse,
  setVisibleItinerary,
  updateItineraryFilter
} from '../../actions/narrative'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import {
  getActiveItineraries,
  getActiveSearch,
  getRealtimeEffects,
  getResponsesWithErrors,
  getVisibleItineraryIndex
} from '../../util/state'

import NarrativeItinerariesErrors from './narrative-itineraries-errors'
import NarrativeItinerariesHeader from './narrative-itineraries-header'

const { ItineraryView } = uiActions

class NarrativeItineraries extends Component {
  static propTypes = {
    activeItinerary: PropTypes.number,
    containerStyle: PropTypes.object,
    itineraries: PropTypes.array,
    pending: PropTypes.bool,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    setItineraryView: PropTypes.func,
    setUseRealtimeResponse: PropTypes.func,
    useRealtime: PropTypes.bool
  }

  static contextType = ComponentContext

  state = { showingErrors: false }

  _setActiveLeg = (index, leg) => {
    const { activeLeg, setActiveLeg, setItineraryView } = this.props
    const isSameLeg = activeLeg === index
    if (isSameLeg) {
      // If clicking on the same leg again, reset it to null,
      // and show the full itinerary (both desktop and mobile view)
      setActiveLeg(null, null)
      setItineraryView(ItineraryView.FULL)
    } else {
      // Focus on the newly selected leg.
      setActiveLeg(index, leg)
      setItineraryView(ItineraryView.LEG)
    }
  }

  _toggleDetailedItinerary = () => {
    const { setActiveLeg, setItineraryView, showDetails } = this.props
    const newView = showDetails ? ItineraryView.LIST : ItineraryView.FULL
    setItineraryView(newView)
    // Reset the active leg.
    setActiveLeg(null, null)
  }

  _onSortChange = evt => {
    const {value: type} = evt.target
    const {sort, updateItineraryFilter} = this.props
    updateItineraryFilter({sort: {...sort, type}})
  }

  _onSortDirChange = () => {
    const {sort, updateItineraryFilter} = this.props
    const direction = sort.direction === 'ASC' ? 'DESC' : 'ASC'
    updateItineraryFilter({sort: {...sort, direction}})
  }

  _onViewAllOptions = () => {
    if (this.props.itineraryIsExpanded) {
      this._toggleDetailedItinerary()
    } else {
      this._toggleShowErrors()
    }
  }

  _toggleShowErrors = () => {
    this.setState({ showingErrors: !this.state.showingErrors })
  }

  _renderLoadingDivs = () => {
    const {itineraries, modes, pending} = this.props
    const {showingErrors} = this.state
    if (!pending || showingErrors) return null
    // Construct loading divs as placeholders while all itineraries load.
    const count = modes.combinations
      ? modes.combinations.length - itineraries.length
      : 0
    return Array.from(
      {length: count},
      (v, i) =>
        <div key={i} className='option default-itin'>
          <SkeletonTheme color='#ddd' highlightColor='#eee'>
            <Skeleton count={3} />
          </SkeletonTheme>
        </div>
    )
  }

  render () {
    const {
      activeItinerary,
      activeLeg,
      activeSearch,
      activeStep,
      containerStyle,
      errorMessages,
      errors,
      itineraries,
      itineraryIsExpanded,
      pending,
      realtimeEffects,
      setActiveItinerary,
      setActiveStep,
      setVisibleItinerary,
      showDetails,
      sort,
      timeFormat,
      useRealtime,
      visibleItinerary
    } = this.props
    const { ItineraryBody, LegIcon } = this.context
    const { showingErrors } = this.state

    if (!activeSearch) return null

    const showRealtimeAnnotation = realtimeEffects.isAffectedByRealtimeData && (
      realtimeEffects.exceedsThreshold ||
      realtimeEffects.routesDiffer ||
      !useRealtime
    )

    return (
      <div className='options itinerary' style={containerStyle}>
        <NarrativeItinerariesHeader
          errors={errors}
          itineraries={itineraries}
          itineraryIsExpanded={itineraryIsExpanded}
          onSortChange={this._onSortChange}
          onSortDirChange={this._onSortDirChange}
          onToggleShowErrors={this._toggleShowErrors}
          onViewAllOptions={this._onViewAllOptions}
          pending={pending}
          showingErrors={showingErrors}
          sort={sort}
        />
        <div
          // FIXME: Change to a ul with li children?
          className='list'
          style={{
            flexGrow: '1',
            overflowY: 'auto'
          }}
        >
          {showingErrors
            ? (
              <NarrativeItinerariesErrors
                errorMessages={errorMessages}
                errors={errors}
              />
            )
            : <>
              {itineraries.map((itinerary, index) => {
                const active = index === activeItinerary
                // Hide non-active itineraries.
                if (!active && itineraryIsExpanded) return null
                return (
                  <ItineraryBody
                    active={active}
                    activeLeg={activeLeg}
                    activeStep={activeStep}
                    expanded={showDetails}
                    index={index}
                    itinerary={itinerary}
                    key={index}
                    LegIcon={LegIcon}
                    onClick={active ? this._toggleDetailedItinerary : undefined}
                    routingType='ITINERARY'
                    setActiveItinerary={setActiveItinerary}
                    setActiveLeg={this._setActiveLeg}
                    setActiveStep={setActiveStep}
                    setVisibleItinerary={setVisibleItinerary}
                    showRealtimeAnnotation={showRealtimeAnnotation}
                    sort={sort}
                    timeFormat={timeFormat}
                    visibleItinerary={visibleItinerary}
                  />
                )
              })}
              {this._renderLoadingDivs()}
            </>
          }
        </div>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const activeItinerary = activeSearch && activeSearch.activeItinerary
  const { errorMessages, modes } = state.otp.config
  const { sort } = state.otp.filter
  const pending = activeSearch ? Boolean(activeSearch.pending) : false
  const itineraries = getActiveItineraries(state.otp)
  const realtimeEffects = getRealtimeEffects(state.otp)
  const useRealtime = state.otp.useRealtime
  const urlParams = coreUtils.query.getUrlParams()
  const itineraryView = urlParams.ui_itineraryView || ItineraryView.LIST
  const showDetails = itineraryView === ItineraryView.FULL ||
          itineraryView === ItineraryView.LEG ||
          itineraryView === ItineraryView.LEG_HIDDEN
  const itineraryIsExpanded = activeItinerary !== undefined &&
    activeItinerary !== null &&
    showDetails

  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeSearch,
    activeStep: activeSearch && activeSearch.activeStep,
    errors: getResponsesWithErrors(state.otp),
    errorMessages,
    itineraries,
    itineraryIsExpanded,
    itineraryView,
    // use a key so that the NarrativeItineraries component and its state is
    // reset each time a new search is shown
    key: state.otp.activeSearchId,
    modes,
    pending,
    realtimeEffects,
    showDetails,
    sort,
    timeFormat: coreUtils.time.getTimeFormat(state.otp.config),
    useRealtime,
    visibleItinerary: getVisibleItineraryIndex(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  // FIXME: update signature of these methods,
  // so that only one argument is passed,
  // e.g. setActiveLeg({ index, leg })
  return {
    setActiveItinerary: payload => dispatch(setActiveItinerary(payload)),
    // FIXME
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({index, leg}))
    },
    // FIXME
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({index, step}))
    },
    setItineraryView: payload => dispatch(uiActions.setItineraryView(payload)),
    setUseRealtimeResponse: payload => dispatch(setUseRealtimeResponse(payload)),
    setVisibleItinerary: payload => dispatch(setVisibleItinerary(payload)),
    updateItineraryFilter: payload => dispatch(updateItineraryFilter(payload))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  NarrativeItineraries
)
