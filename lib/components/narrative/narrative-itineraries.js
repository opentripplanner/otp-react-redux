/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { differenceInDays } from 'date-fns'
import { FormattedMessage, injectIntl } from 'react-intl'
import { isFlex, isTransit } from '@opentripplanner/core-utils/lib/itinerary'
import clone from 'clone'
import coreUtils from '@opentripplanner/core-utils'
import memoize from 'lodash.memoize'
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
  getVisibleItineraryIndex,
  sortItinerariesInPlaceIfNeeded
} from '../../util/state'
import {
  getFirstLegStartTime,
  itinerariesAreEqual,
  sortStartTimes
} from '../../util/itinerary'
import { getItineraryView, ItineraryView } from '../../util/ui'
import {
  setActiveItinerary,
  setActiveLeg,
  setActiveStep,
  setVisibleItinerary,
  updateItineraryFilter
} from '../../actions/narrative'
import { summarizeQuery } from '../form/user-settings-i18n'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import PageTitle from '../util/page-title'

import * as S from './styled'
import { getItineraryDescription } from './default/itinerary-description'
import ErrorRenderer from './metro/metro-error-renderer'
import Loading from './loading'
import NarrativeItinerariesErrors from './narrative-itineraries-errors'
import NarrativeItinerariesHeader from './narrative-itineraries-header'

/** Creates a start time object for the given itinerary. */
function makeStartTime(itinerary) {
  return {
    itinerary,
    legs: itinerary.legs,
    realtime: firstTransitLegIsRealtime(itinerary)
  }
}

export const doMergeItineraries = memoize((itineraries) => {
  const mergedItineraries = itineraries
    .reduce((prev, cur) => {
      const updatedItineraries = clone(prev)
      const updatedItinerary = clone(cur)

      const duplicateIndex = updatedItineraries.findIndex((itin) =>
        itinerariesAreEqual(itin, cur)
      )
      // If no duplicate, push full itinerary to output
      if (duplicateIndex === -1 || cur.legs.some(isFlex)) {
        updatedItineraries.push(updatedItinerary)
      } else if (
        // Only process itineraries less than 24 hours in the future
        differenceInDays(updatedItinerary.startTime, Date.now()) < 1
      ) {
        const duplicateFoundItin = updatedItineraries[duplicateIndex]
        // TODO: MERGE ROUTE NAMES

        // Add only new start time to existing itinerary.
        // The existing itinerary is the earliest between
        // this itinerary (updatedItinerary) and duplicateItin.
        // This is because alternate routes are only added to the first non-duplicate itinerary,
        // and we show alternate routes for the first (i.e. earliest) non-duplicate itinerary found.
        let duplicateItin = duplicateFoundItin
        let itinCopyToAdd = updatedItinerary
        if (duplicateFoundItin.startTime > updatedItinerary.startTime) {
          duplicateItin = updatedItinerary
          duplicateItin.startTimes = duplicateFoundItin.allStartTimes
          updatedItineraries[duplicateIndex] = updatedItinerary
          itinCopyToAdd = duplicateFoundItin
        }

        if (!duplicateItin.allStartTimes) {
          duplicateItin.allStartTimes = [makeStartTime(duplicateItin)]
        }
        // Only add new time if it doesn't already exist. It would be better to use
        // the uniqueness feature of Set, but unfortunately objects are never equal
        if (
          !duplicateItin.allStartTimes.find(
            (time) =>
              getFirstLegStartTime(time.legs) === itinCopyToAdd.startTime
          )
        ) {
          duplicateItin.allStartTimes.push(makeStartTime(itinCopyToAdd))
        }

        // Some legs will be the same, but have a different route
        // This map catches those and stores the alternate routes so they can be displayed
        duplicateItin.legs = duplicateItin.legs.map((leg, index) => {
          const newLeg = clone(leg)
          const curLeg = itinCopyToAdd.legs[index]
          const curLegRouteId = curLeg?.routeId
          if (curLegRouteId && leg?.routeId && leg?.routeId !== curLegRouteId) {
            if (!newLeg.alternateRoutes) {
              newLeg.alternateRoutes = {}
            }
            newLeg.alternateRoutes[curLegRouteId] = {
              // We save the entire leg to the alternateRoutes object so in
              // the future, we can draw the leg on the map as an alternate route
              ...curLeg
            }
          }
          return newLeg
        })
      }
      return updatedItineraries
    }, [])
    .map((itin) => {
      // Sort allStartTimes if defined,
      // and display the earliest itinerary in each group.
      if (itin.allStartTimes?.length) {
        const sortedTimes = sortStartTimes(itin.allStartTimes)
        const firstItinerary = sortedTimes[0].itinerary
        firstItinerary.allStartTimes = sortedTimes
        return firstItinerary
      } else {
        return itin
      }
    })

  // Add allStartTime info from mergedItineraries to the original itineraries
  const allItineraries = itineraries.map((itin, index) => {
    return {
      ...itin,
      allStartTimes: mergedItineraries.find((itn) =>
        itn.allStartTimes?.find((st) => st.itinerary.index === index)
      )?.allStartTimes,
      index
    }
  })

  return {
    allItineraries,
    mergedItineraries
  }
})

// FIXME: move to typescript once shared types exist
class NarrativeItineraries extends Component {
  static propTypes = {
    activeItinerary: PropTypes.number,
    activeLeg: PropTypes.object,
    activeSearch: PropTypes.object,
    activeStep: PropTypes.object,
    containerStyle: PropTypes.object,
    customBatchUiBackground: PropTypes.bool,
    enabledSortModes: PropTypes.object,
    errorMessages: PropTypes.object,
    errors: PropTypes.array,
    itineraries: PropTypes.array,
    itineraryIsExpanded: PropTypes.bool,
    modes: PropTypes.object,
    pending: PropTypes.bool,
    popupTarget: PropTypes.string,
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
    visibleItinerary: PropTypes.number
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

  _onSortChange = (type) => {
    const { sort, updateItineraryFilter } = this.props
    updateItineraryFilter({ sort: { ...sort, type } })
  }

  _onSortDirChange = () => {
    const { sort, updateItineraryFilter } = this.props
    const direction = sort.direction === 'ASC' ? 'DESC' : 'ASC'
    updateItineraryFilter({ sort: { ...sort, direction } })
  }

  _onViewAllOptions = () => {
    const { itineraryIsExpanded, setActiveItinerary } = this.props

    setActiveItinerary({ index: -1 })

    if (itineraryIsExpanded) {
      this._toggleDetailedItinerary()
    } else {
      this._toggleShowErrors()
    }
  }

  _toggleShowErrors = () => {
    this.setState({ showingErrors: !this.state.showingErrors })
  }

  _renderLoadingSpinner = () => {
    const { pending, renderSkeletons } = this.props
    if (!renderSkeletons) {
      return pending ? <Loading /> : null
    }
  }

  _renderLoadingDivs = () => {
    const { itineraries, modes, pending, renderSkeletons } = this.props
    const { showingErrors } = this.state

    // If renderSkeletons is off, don't render the skeleton-type loading divs
    if (!renderSkeletons) {
      return null
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

    if (!itinerary) return null
    // Hide non-active itineraries.
    const active = itinerary.index === activeItinerary
    const visible = itinerary.index === visibleItinerary
    if (!active && itineraryIsExpanded) return null

    const { ItineraryBody, LegIcon } = this.context
    const ListItem = itineraryIsExpanded ? 'div' : 'li'

    const showRealtimeAnnotation =
      realtimeEffects.isAffectedByRealtimeData &&
      (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer)

    return (
      <ListItem
        className="result"
        // Ensure we update if the active itinerary changes.
        key={itinerary.index}
      >
        <ItineraryBody
          active={active}
          activeLeg={activeLeg}
          activeStep={activeStep}
          expanded={showDetails}
          index={itinerary.index}
          itinerary={itinerary}
          LegIcon={LegIcon}
          mini={mini}
          onClick={active ? this._toggleDetailedItinerary : undefined}
          role="listitem"
          routingType="ITINERARY"
          setActiveItinerary={setActiveItinerary}
          setActiveLeg={this._setActiveLeg}
          setActiveStep={setActiveStep}
          setVisibleItinerary={setVisibleItinerary}
          showRealtimeAnnotation={showRealtimeAnnotation}
          sort={sort}
          timeFormat={timeFormat}
          toggleDetailedItinerary={this._toggleDetailedItinerary}
          visible={visible}
        />
      </ListItem>
    )
  }

  componentDidUpdate(prevProps) {
    // If set in URL, set the active itinerary in the state, once.
    const {
      activeItinerary,
      activeSearch,
      itineraryConfig,
      mergedItineraries,
      setActiveItinerary,
      setVisibleItinerary,
      visibleItinerary
    } = this.props
    const { ui_activeItinerary: uiActiveItinerary } =
      coreUtils.query.getUrlParams() || {}
    if (
      activeSearch &&
      uiActiveItinerary !== undefined &&
      uiActiveItinerary !== '-1' &&
      activeItinerary !== +uiActiveItinerary
    ) {
      setActiveItinerary({ index: +uiActiveItinerary })
      setVisibleItinerary({ index: +uiActiveItinerary })
    }

    /**
     * Showing the first result by default is a lot more complicated now that we have
     * fixed indices. We must update the visible itinerary here instead of in the redux state.
     * Also, we need to update whenever new items arrive, to make sure that the highlighted
     * itinerary is indeed the first one.
     *
     * Finally, we need to make sure we only update if the data changes, not if the user actually
     * highlighted something else on their own.
     */
    if (itineraryConfig?.showFirstResultByDefault) {
      if (
        activeItinerary === -1 &&
        (visibleItinerary === null || visibleItinerary === false) &&
        prevProps.mergedItineraries.length !== mergedItineraries.length
      ) {
        setVisibleItinerary({
          index: mergedItineraries?.length > 0 && mergedItineraries?.[0].index
        })
      }
    }
  }

  // eslint-disable-next-line complexity
  render() {
    const {
      activeItinerary,
      activeSearch,
      customBatchUiBackground,
      enabledSortModes,
      errorMessages,
      errors,
      errorsOtp2,
      groupItineraries,
      groupTransitModes,
      intl,
      itineraries,
      itineraryIsExpanded,
      mergedItineraries,
      pending,
      popupTarget,
      setPopupContent,
      showHeaderText,
      sort,
      user
    } = this.props
    const { showingErrors } = this.state

    if (!activeSearch) return null

    // render lists become divs if itinerary is expanded, to avoid rendering a list with list item
    const ListContainer = itineraryIsExpanded ? 'div' : S.ULContainer
    const itinerary = itineraries?.[activeItinerary]

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

        // Identify whether an itinerary uses transit & sort into appropriate bucket
        const transitLegs = cur.legs.filter(
          (leg) => isTransit(leg.mode) | leg.transitLeg
        )

        const modeContainer =
          transitLegs.length > 0 ? modeItinMap.multi : modeItinMap.single

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
        <PageTitle
          title={summarizeQuery(activeSearch.query, intl, user.savedLocations)}
        />
        <NarrativeItinerariesHeader
          customBatchUiBackground={customBatchUiBackground}
          enabledSortModes={enabledSortModes}
          errors={errors}
          itineraries={mergedItineraries}
          itinerary={itinerary}
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
          id="itinerary-menu"
          style={{
            flexGrow: '1',
            overflowY: 'auto'
          }}
        >
          {!pending && (
            <ErrorRenderer
              errors={errorsOtp2}
              itinerariesLength={mergedItineraries.length}
            />
          )}
          {showingErrors || mergedItineraries.length === 0 ? (
            <NarrativeItinerariesErrors
              errorMessages={errorMessages}
              errors={errors}
            />
          ) : (
            <>
              {groupItineraries && !itineraryIsExpanded ? (
                Object.keys(groupedMergedItineraries.multi).map((mode) => {
                  return (
                    <S.ModeResultContainer key={mode}>
                      {/* The header for each mode combination (e.g. "Walk + Transit") is an <h3> element
                          because it falls under the "n Itineraries Found" header, which is an <h2> element. */}
                      <h3>{mode}</h3>
                      <ListContainer>
                        {groupedMergedItineraries.multi[mode].map((itin) =>
                          this._renderItineraryRow(itin)
                        )}
                      </ListContainer>
                    </S.ModeResultContainer>
                  )
                })
              ) : itineraryIsExpanded ? (
                // This case is for the expanded view of one itinerary.
                <ListContainer>
                  {this._renderItineraryRow(itinerary)}
                </ListContainer>
              ) : (
                // Let itineraries trickle in.
                <ListContainer>
                  {mergedItineraries.map((itin) =>
                    this._renderItineraryRow(itin)
                  )}
                </ListContainer>
              )}
              {this._renderLoadingDivs()}
              {groupItineraries &&
                !itineraryIsExpanded &&
                Object.keys(groupedMergedItineraries.single).length > 0 && (
                  <S.ModeResultContainer>
                    {/* The non-transit a11y header is an <h3> element because
                        it falls under the "n Itineraries Found" header, which is an <h2> element. */}
                    <InvisibleA11yLabel as="h3">
                      <FormattedMessage id="components.DefaultItinerary.nonTransit" />
                    </InvisibleA11yLabel>
                    <S.SingleModeRowContainer>
                      {Object.keys(groupedMergedItineraries.single).map(
                        (mode) =>
                          groupedMergedItineraries.single[mode].map((itin) =>
                            this._renderItineraryRow(itin, true)
                          )
                      )}
                    </S.SingleModeRowContainer>
                  </S.ModeResultContainer>
                )}
            </>
          )}
          {this._renderLoadingSpinner()}
        </div>
      </S.NarrativeItinerariesContainer>
    )
  }
}

const reduceErrorsFromResponse = (acc, cur) => {
  const { routingErrors } = cur?.plan || {}
  if (routingErrors) {
    routingErrors.forEach((routingError) => {
      const { code, inputField } = routingError
      if (!acc[code]) {
        acc[code] = new Set()
      }
      acc[code].add(inputField)
    })
  }
  return acc
}

// connect to the redux store

const mapStateToProps = (state) => {
  const { config, filter } = state.otp
  const { co2, errorMessages, itinerary, modes } = config
  const { sort } = filter

  const activeSearch = getActiveSearch(state)
  const activeItinerary = activeSearch?.activeItinerary
  const pending = activeSearch?.pending > 0
  const itinsWithCo2 = getActiveItineraries(state)
  const realtimeEffects = getRealtimeEffects(state)
  const urlParams = coreUtils.query.getUrlParams()
  const itineraryView = getItineraryView(urlParams)
  const showDetails =
    itineraryView === ItineraryView.FULL ||
    itineraryView === ItineraryView.LEG ||
    itineraryView === ItineraryView.LEG_HIDDEN
  const {
    customBatchUiBackground,
    groupByMode: groupItineraries,
    groupTransitModes,
    mergeItineraries,
    showHeaderText,
    sortModes
  } = config.itinerary || false
  // Default to true for backwards compatibility
  const renderSkeletons = !config.itinerary?.hideSkeletons
  const itineraryIsExpanded =
    activeItinerary !== undefined && activeItinerary !== null && showDetails
  const { localUser, loggedInUser } = state.user
  const user = loggedInUser || localUser

  // Merge duplicate itineraries together and save multiple departure times
  let mergedItineraries
  let allItineraries
  if (mergeItineraries) {
    // eslint-disable-next-line prettier/prettier
    ({ allItineraries, mergedItineraries } = doMergeItineraries(itinsWithCo2))
  } else {
    allItineraries = itinsWithCo2
    mergedItineraries = [...allItineraries]
  }

  // Sort the merged (displayed) itineraries if needed
  sortItinerariesInPlaceIfNeeded(mergedItineraries, state)

  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    activeItinerary,
    activeLeg: activeSearch?.activeLeg,
    activeSearch,
    activeStep: activeSearch?.activeStep,
    co2Config: co2,
    customBatchUiBackground,
    enabledSortModes: sortModes,
    errorMessages,
    errors: getResponsesWithErrors(state),
    // TODO: Destroy otp1 errors and rename this
    errorsOtp2: activeSearch?.response?.reduce(reduceErrorsFromResponse, {}),
    groupItineraries,
    groupTransitModes,
    itineraries: allItineraries,
    itineraryConfig: itinerary,
    itineraryIsExpanded,
    // use a key so that the NarrativeItineraries component and its state is
    // reset each time a new search is shown
    key: state.otp.activeSearchId,
    mergedItineraries,
    modes,
    pending,
    popupTarget: config.popups?.launchers?.optionFilter,
    realtimeEffects,
    renderSkeletons,
    showDetails,
    showHeaderText,
    sort,
    timeFormat: coreUtils.time.getTimeFormat(config),
    user,
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
