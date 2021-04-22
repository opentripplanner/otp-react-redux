import coreUtils from '@opentripplanner/core-utils'
import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { connect } from 'react-redux'
import styled from 'styled-components'

import {
  setActiveItinerary,
  setActiveLeg,
  setActiveStep,
  setUseRealtimeResponse,
  setVisibleItinerary,
  updateItineraryFilter
} from '../../actions/narrative'
import * as uiActions from '../../actions/ui'
import Icon from '../narrative/icon'
import { ComponentContext } from '../../util/contexts'
import {
  getActiveItineraries,
  getActiveSearch,
  getErrorMessage,
  getRealtimeEffects,
  getResponsesWithErrors
} from '../../util/state'

import SaveTripButton from './save-trip-button'

const { ItineraryView } = uiActions

const IssueContainer = styled.div`
  display: flex;
  padding: 5px;
`

const IssueIconContainer = styled.div`
  font-size: 18px;
  height: 24px;
  width: 24px;
`

const IssueContents = styled.div`
  font-size: 12px;
  margin-left: 10px;
  text-align: left;
`

const IssueButton = styled.button`
  background-color: #ECBE03;
  border: none;
  border-radius: 5px;
  display: inline-block;
  font-size: 12px;
  padding: 4px;

  span {
    margin-left: 4px;
  }
`

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

  _toggleRealtimeItineraryClick = (e) => {
    const {setUseRealtimeResponse, useRealtime} = this.props
    setUseRealtimeResponse({useRealtime: !useRealtime})
  }

  _toggleShowErrors = () => {
    this.setState({ showingErrors: !this.state.showingErrors })
  }

  _renderErrors = () => {
    const { errorMessages, errors } = this.props
    return errors.map((error, idx) => {
      let icon
      if (error.network) {
        const CompanyIcon = getCompanyIcon(error.network)
        icon = <CompanyIcon />
      } else {
        icon = <Icon className='text-warning' type='exclamation-triangle' />
      }
      return (
        <div className='option default-itin' key={idx}>
          <IssueContainer>
            <IssueIconContainer>
              {icon}
            </IssueIconContainer>
            <IssueContents>
              {getErrorMessage(error, errorMessages)}
            </IssueContents>
          </IssueContainer>
        </div>
      )
    })
  }

  _renderErrorsButton = () => {
    const { errors } = this.props
    if (errors.length === 0) return null
    return (
      <IssueButton onClick={this._toggleShowErrors}>
        <i className='fa fa-warning' />
        <span>{errors.length} issues</span>
      </IssueButton>
    )
  }

  _renderHeader = () => {
    const {
      errors,
      itineraries,
      itineraryIsExpanded,
      pending,
      sort
    } = this.props
    const { showingErrors } = this.state

    let resultText, titleText
    if (pending) {
      resultText = 'Finding your options...'
      titleText = 'Finding your options...'
    } else {
      const itineraryPlural = itineraries.length === 1
        ? 'itinerary'
        : 'itineraries'
      const issuePlural = errors.length === 1
        ? 'issue'
        : 'issues'
      resultText = `${itineraries.length} ${itineraryPlural} found.`
      titleText = errors.length > 0
        ? `${itineraries.length} ${itineraryPlural} (and ${errors.length} ${issuePlural}) found`
        : resultText
    }

    let content

    if (itineraryIsExpanded || showingErrors) {
      content = (
        <>
          <button
            className='clear-button-formatting'
            onClick={itineraryIsExpanded
              ? this._toggleDetailedItinerary
              : this._toggleShowErrors
            }
          >
            <i className='fa fa-arrow-left' /> View all options
          </button>

          {itineraryIsExpanded && <SaveTripButton />}
        </>
      )
    } else {
      content = (
        <>
          <div
            style={{flexGrow: 1}}
            title={titleText}
          >
            <span style={{
              marginRight: '10px',
            }}>
              {resultText}
            </span>
            {this._renderErrorsButton()}
          </div>
          <div style={{display: 'flex', float: 'right'}}>
            <button
              className='clear-button-formatting'
              onClick={this._onSortDirChange}
              style={{marginRight: '5px'}}
            >
              <i className={`fa fa-sort-amount-${sort.direction.toLowerCase()}`} />
            </button>
            <select
              onBlur={this._onSortChange}
              onChange={this._onSortChange}
              value={sort.value}
            >
              <option value='BEST'>Best option</option>
              <option value='DURATION'>Duration</option>
              <option value='ARRIVALTIME'>Arrival time</option>
              <option value='DEPARTURETIME'>Departure time</option>
              <option value='WALKTIME'>Walk time</option>
              <option value='COST'>Cost</option>
            </select>
          </div>
        </>
      )
    }

    return (
      <div
        className='options header'
        style={{
          alignItems: 'end',
          display: 'flex'
        }}
      >
        {content}
      </div>
    )
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
      itineraries,
      itineraryIsExpanded,
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

    let content

    if (showingErrors) {
      content = this._renderErrors()
    } else {
      content = (
        <>
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
      )
    }

    return (
      <div className='options itinerary' style={containerStyle}>
        {this._renderHeader()}
        <div
          // FIXME: Change to a ul with li children?
          className='list'
          style={{
            flexGrow: '1',
            overflowY: 'auto'
          }}
        >
          {content}
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
  const itineraryView = urlParams.ui_itineraryView || ItineraryView.DEFAULT
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
    visibleItinerary: activeSearch && activeSearch.visibleItinerary
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
