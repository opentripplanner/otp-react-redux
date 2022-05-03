/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import clone from 'clone'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import {
  getActiveItineraries,
  getActiveSearch,
  getRealtimeEffects,
  getResponsesWithErrors,
  getVisibleItineraryIndex
} from '../../util/state'
import { itinerariesAreEqual } from '../../util/itinerary'
import {
  setActiveItinerary,
  setActiveLeg,
  setActiveStep,
  setVisibleItinerary,
  updateItineraryFilter
} from '../../actions/narrative'

import * as S from './styled'
import { getItineraryDescription } from './default/itinerary-description'
import NarrativeItinerariesErrors from './narrative-itineraries-errors'
import NarrativeItinerariesHeader from './narrative-itineraries-header'

const { ItineraryView } = uiActions

// FIXME: move to typescript once shared types exist
class NarrativeItineraries extends Component {
  static propTypes = {
    activeItinerary: PropTypes.number,
    activeLeg: PropTypes.object,
    activeSearch: PropTypes.object,
    activeStep: PropTypes.object,
    containerStyle: PropTypes.object,
    customBatchUiBackground: PropTypes.bool,
    errorMessages: PropTypes.object,
    errors: PropTypes.object,
    itineraries: PropTypes.array,
    itineraryIsExpanded: PropTypes.bool,
    modes: PropTypes.object,
    pending: PropTypes.bool,
    realtimeEffects: PropTypes.object,
    renderSkeletons: PropTypes.bool,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    setItineraryView: PropTypes.func,
    setVisibleItinerary: PropTypes.func,
    showDetails: PropTypes.bool,
    showHeaderText: PropTypes.bool,
    sort: PropTypes.object,
    timeFormat: PropTypes.string,
    updateItineraryFilter: PropTypes.func,
    visibleItinerary: PropTypes.object
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

  _onSortChange = (evt) => {
    const { value: type } = evt.target
    const { sort, updateItineraryFilter } = this.props
    updateItineraryFilter({ sort: { ...sort, type } })
  }

  _onSortDirChange = () => {
    const { sort, updateItineraryFilter } = this.props
    const direction = sort.direction === 'ASC' ? 'DESC' : 'ASC'
    updateItineraryFilter({ sort: { ...sort, direction } })
  }

  _onViewAllOptions = () => {
    const {
      hideFirstResultByDefault,
      itineraryIsExpanded,
      setActiveItinerary
    } = this.props

    if (hideFirstResultByDefault) {
      setActiveItinerary({ index: -1 })
    }
    if (itineraryIsExpanded) {
      this._toggleDetailedItinerary()
    } else {
      this._toggleShowErrors()
    }
  }

  _toggleShowErrors = () => {
    this.setState({ showingErrors: !this.state.showingErrors })
  }

  _renderLoadingDivs = () => {
    const { itineraries, modes, pending, renderSkeletons } = this.props
    const { showingErrors } = this.state
    if (!pending || showingErrors || !renderSkeletons) return null
    // Construct loading divs as placeholders while all itineraries load.
    const count = modes.combinations
      ? modes.combinations.length - itineraries.length
      : 0
    return Array.from({ length: count }, (v, i) => (
      <div className="option default-itin" key={i}>
        <SkeletonTheme color="#ddd" highlightColor="#eee">
          <Skeleton count={3} />
        </SkeletonTheme>
      </div>
    ))
  }

  _renderItineraryRow = (itinerary, mini = false) => {
    const {
      activeItinerary,
      activeLeg,
      activeStep,
      itineraryIsExpanded,
      realtimeEffects,
      setActiveItinerary,
      setActiveStep,
      setVisibleItinerary,
      showDetails,
      sort,
      timeFormat,
      visibleItinerary
    } = this.props
    const { ItineraryBody, LegIcon } = this.context

    const showRealtimeAnnotation =
      realtimeEffects.isAffectedByRealtimeData &&
      (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer)

    const active = itinerary.index === activeItinerary
    // Hide non-active itineraries.
    if (!active && itineraryIsExpanded) return null

    return (
      <ItineraryBody
        active={active}
        activeLeg={activeLeg}
        activeStep={activeStep}
        expanded={showDetails}
        index={itinerary.index}
        itinerary={itinerary}
        key={itinerary.index}
        LegIcon={LegIcon}
        mini={mini}
        onClick={active ? this._toggleDetailedItinerary : undefined}
        routingType="ITINERARY"
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
  }

  render() {
    const {
      activeSearch,
      customBatchUiBackground,
      errorMessages,
      errors,
      groupItineraries,
      groupTransitModes,
      intl,
      itineraries,
      itineraryIsExpanded,
      pending,
      showHeaderText,
      sort
    } = this.props
    const { showingErrors } = this.state

    if (!activeSearch) return null

    // Merge duplicate itineraries together and save multiple departure times
    const mergedItineraries = itineraries.reduce((prev, cur, curIndex) => {
      const updatedItineraries = clone(prev)
      const updatedItinerary = clone(cur)
      updatedItinerary.index = curIndex

      const duplicateIndex = updatedItineraries.findIndex((itin) =>
        itinerariesAreEqual(itin, cur)
      )
      // If no duplicate, push full itinerary to output
      if (duplicateIndex === -1) {
        updatedItineraries.push(updatedItinerary)
      } else {
        const duplicateItin = updatedItineraries[duplicateIndex]
        // Add only new start time to existing itinerary
        if (!duplicateItin.allStartTimes) {
          duplicateItin.allStartTimes = new Set()
          duplicateItin.allStartTimes.add(duplicateItin.startTime)
        }
        // Ensure that the lowest start time is always first
        duplicateItin.allStartTimes.add(cur.startTime)
      }
      return updatedItineraries
    }, [])

    const groupedMergedItineraries = mergedItineraries
      // First, group each itinerary by mode
      .reduce(
        (prev, cur) => {
          const modeItinMap = clone(prev)
          const modeString = getItineraryDescription({
            combineTransitModes: groupTransitModes,
            intl,
            itinerary: cur
          })
          // insert mode into correct object
          const modeContainer =
            modeString.indexOf(' ') > -1
              ? modeItinMap.multi
              : modeItinMap.single

          if (!modeContainer[modeString]) modeContainer[modeString] = []
          modeContainer[modeString].push(cur)
          return modeItinMap
        },
        { multi: {}, single: {} }
      )

    return (
      <S.NarrativeItinerariesContainer
        className={`options itinerary ${
          customBatchUiBackground && !itineraryIsExpanded && 'base-color-bg'
        }`}
      >
        <NarrativeItinerariesHeader
          customBatchUiBackground={customBatchUiBackground}
          errors={errors}
          itineraries={mergedItineraries}
          itineraryIsExpanded={itineraryIsExpanded}
          onSortChange={this._onSortChange}
          onSortDirChange={this._onSortDirChange}
          onToggleShowErrors={this._toggleShowErrors}
          onViewAllOptions={this._onViewAllOptions}
          pending={pending}
          showHeaderText={showHeaderText}
          showingErrors={showingErrors}
          sort={sort}
        />
        <div
          // FIXME: Change to a ul with li children?
          className="list"
          style={{
            flexGrow: '1',
            overflowY: 'auto'
          }}
        >
          {showingErrors || mergedItineraries.length === 0 ? (
            <NarrativeItinerariesErrors
              errorMessages={errorMessages}
              errors={errors}
            />
          ) : (
            <>
              {groupItineraries && !itineraryIsExpanded
                ? Object.keys(groupedMergedItineraries.multi).map((mode) => {
                    return (
                      <div key={mode} style={{ padding: '0 1em' }}>
                        <h2>{mode}</h2>
                        {groupedMergedItineraries.multi[mode].map((itin) =>
                          this._renderItineraryRow(itin)
                        )}
                      </div>
                    )
                  })
                : mergedItineraries.map((itin) =>
                    this._renderItineraryRow(itin)
                  )}
              {this._renderLoadingDivs()}
              <S.SingleModeRowContainer>
                {groupItineraries &&
                  !itineraryIsExpanded &&
                  Object.keys(groupedMergedItineraries.single).map((mode) =>
                    groupedMergedItineraries.single[mode].map((itin) =>
                      this._renderItineraryRow(itin, true)
                    )
                  )}
              </S.SingleModeRowContainer>
            </>
          )}
        </div>
      </S.NarrativeItinerariesContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  const activeSearch = getActiveSearch(state)
  const activeItinerary = activeSearch && activeSearch.activeItinerary
  const { errorMessages, modes } = state.otp.config
  const { sort } = state.otp.filter
  const pending = activeSearch ? Boolean(activeSearch.pending) : false
  const itineraries = getActiveItineraries(state)
  const realtimeEffects = getRealtimeEffects(state)
  const urlParams = coreUtils.query.getUrlParams()
  const itineraryView = urlParams.ui_itineraryView || ItineraryView.LIST
  const showDetails =
    itineraryView === ItineraryView.FULL ||
    itineraryView === ItineraryView.LEG ||
    itineraryView === ItineraryView.LEG_HIDDEN
  const {
    customBatchUiBackground,
    groupByMode: groupItineraries,
    groupTransitModes,
    showHeaderText
  } = state.otp.config.itinerary
  // Default to true for backwards compatibility
  const renderSkeletons = !state.otp.config.itinerary.hideSkeletons
  const hideFirstResultByDefault =
    !state.otp.config.itinerary.showFirstResultByDefault
  const itineraryIsExpanded =
    activeItinerary !== undefined && activeItinerary !== null && showDetails

  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeSearch,
    activeStep: activeSearch && activeSearch.activeStep,
    customBatchUiBackground,
    errorMessages,
    errors: getResponsesWithErrors(state),
    groupItineraries,
    groupTransitModes,
    hideFirstResultByDefault,
    itineraries,
    itineraryIsExpanded,
    itineraryView,
    // use a key so that the NarrativeItineraries component and its state is
    // reset each time a new search is shown
    key: state.otp.activeSearchId,
    modes,
    pending,
    realtimeEffects,
    renderSkeletons,
    showDetails,
    showHeaderText,
    sort,
    timeFormat: coreUtils.time.getTimeFormat(state.otp.config),
    visibleItinerary: getVisibleItineraryIndex(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  // FIXME: update signature of these methods,
  // so that only one argument is passed,
  // e.g. setActiveLeg({ index, leg })
  return {
    setActiveItinerary: (payload) => dispatch(setActiveItinerary(payload)),
    // FIXME
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({ index, leg }))
    },
    // FIXME
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({ index, step }))
    },
    setItineraryView: (payload) =>
      dispatch(uiActions.setItineraryView(payload)),
    setVisibleItinerary: (payload) => dispatch(setVisibleItinerary(payload)),
    updateItineraryFilter: (payload) => dispatch(updateItineraryFilter(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(NarrativeItineraries))
