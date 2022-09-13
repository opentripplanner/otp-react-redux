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
import { firstTransitLegIsRealtime } from '../../util/viewer'
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
import Loading from './loading'
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
    popupTarget: PropTypes.object,
    realtimeEffects: PropTypes.object,
    renderSkeletons: PropTypes.bool,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    setItineraryView: PropTypes.func,
    setPopupContent: PropTypes.func,
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

    // If renderSkeletons is off, show standard spinner
    if (!renderSkeletons) {
      return pending ? <Loading /> : null
    }

    if (!pending || showingErrors) return null

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
      activeItineraryTimeIndex,
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
        activeItineraryTimeIndex={activeItineraryTimeIndex}
        activeLeg={activeLeg}
        activeStep={activeStep}
        expanded={showDetails}
        index={itinerary.index}
        itinerary={itinerary}
        // Ensure we update if either index changes
        key={(activeItineraryTimeIndex << 8) | itinerary.index}
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
      popupTarget,
      setPopupContent,
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
      } else if (
        // Only process itineraries less than 24 hours in the future
        updatedItinerary.startTime <
        // Server UTF offset
        (updatedItinerary?.agencyTimeZoneOffset || 0) +
          // Client UTC offset
          new Date().getTimezoneOffset() +
          // Current timestamp
          Date.now() +
          // 24 hours in milliseconds
          24 * 60 * 60 * 1000
      ) {
        const duplicateItin = updatedItineraries[duplicateIndex]
        // TODO: MERGE ROUTE NAMES

        // Add only new start time to existing itinerary
        if (!duplicateItin.allStartTimes) {
          duplicateItin.allStartTimes = [
            {
              legs: duplicateItin.legs,
              realtime: firstTransitLegIsRealtime(duplicateItin)
            }
          ]
        }
        // Only add new time if it doesn't already exist. It would be better to use
        // the uniqueness feature of Set, but unfortunately objects are never equal
        if (
          !duplicateItin.allStartTimes.find(
            (time) => time.time === cur.startTime
          )
        ) {
          duplicateItin.allStartTimes.push({
            legs: cur.legs,
            realtime: firstTransitLegIsRealtime(cur)
          })
        }

        // Some legs will be the same, but have a different route
        // This map catches those and stores the alternate routes so they can be displayed
        duplicateItin.legs = duplicateItin.legs.map((leg, index) => {
          const newLeg = clone(leg)
          if (leg?.routeId !== cur.legs[index]?.routeId) {
            if (!newLeg.alternateRoutes) {
              newLeg.alternateRoutes = {}
            }
            const { routeId } = cur.legs?.[index]
            newLeg.alternateRoutes[routeId] = {
              // We save the entire leg to the alternateRoutes object so in
              // the future, we can draw the leg on the map as an alternate route
              ...cur.legs?.[index]
            }
          }
          return newLeg
        })
      }
      return updatedItineraries
    }, [])

    // This loop determines if an itinerary uses a single or multiple modes
    const groupedMergedItineraries = mergedItineraries.reduce(
      (prev, cur) => {
        // Create a clone of our buckets
        const modeItinMap = clone(prev)
        // We generate a mode string description as this handles
        // a lot of the itinerary processing work for us
        const modeString = getItineraryDescription({
          combineTransitModes: groupTransitModes,
          intl,
          itinerary: cur
        })

        // We determine which "bucket" to put this itinerary into based on what
        // is currently a hack hack hack: looking at the presence of a space
        // in the mode string.
        //
        // Another approach may be cleaner, but this includes the least overhead
        const modeContainer =
          modeString.indexOf(' ') > -1 ? modeItinMap.multi : modeItinMap.single

        // Now that we know the mode container to place our itinerary in, we do so
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
          popupTarget={popupTarget}
          setPopupContent={setPopupContent}
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
  const activeItineraryTimeIndex =
    activeSearch && activeSearch.activeItineraryTimeIndex
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
  } = state.otp.config?.itinerary || false
  // Default to true for backwards compatibility
  const renderSkeletons = !state.otp.config.itinerary?.hideSkeletons
  const hideFirstResultByDefault =
    !state.otp.config.itinerary?.showFirstResultByDefault
  const itineraryIsExpanded =
    activeItinerary !== undefined && activeItinerary !== null && showDetails

  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    activeItinerary,
    activeItineraryTimeIndex,
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
    popupTarget: state.otp.config?.popups?.launchers?.optionFilter,
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
    setPopupContent: (payload) => dispatch(uiActions.setPopupContent(payload)),
    setVisibleItinerary: (payload) => dispatch(setVisibleItinerary(payload)),
    updateItineraryFilter: (payload) => dispatch(updateItineraryFilter(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(NarrativeItineraries))
