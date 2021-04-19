import coreUtils from '@opentripplanner/core-utils'
import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  ListGroup,
  ListGroupItem,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'
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
  getFeedWideRentalErrors,
  getRealtimeEffects,
  getResponsesWithErrors
} from '../../util/state'

import SaveTripButton from './save-trip-button'

const { ItineraryView } = uiActions

// TODO: move to utils?
function humanReadableMode (modeStr) {
  if (!modeStr) return 'N/A'
  const arr = modeStr.toLowerCase().replace(/_/g, ' ').split(',')
  if (arr.length > 2) {
    const last = arr.pop()
    return arr.join(', ') + ' and ' + last
  } else {
    return arr.join(' and ')
  }
}

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

const IssueWell = styled.div`
  background-color: #ECBE03;
  border-radius: 5px;
  display: inline-block;
  font-size: 12px;
  margin-left: 10px;
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

  _renderHeader = () => {
    const {
      errors,
      itineraries,
      itineraryIsExpanded,
      pending,
      sort
    } = this.props

    const issues = []
    const networksWithFeedWideErrors = {}
    errors.forEach(error => {
      // first check if there were feed-wide network errors associated with the
      // response
      const feedWideRentalErrors = getFeedWideRentalErrors(error)
      if (feedWideRentalErrors.length > 0) {
        // there were errors, add issues for each network that had a feed-wide
        // error
        feedWideRentalErrors.forEach(networkWithFeedWideError => {
          const { network } = networkWithFeedWideError
          if (!networksWithFeedWideErrors[network]) {
            const CompanyIcon = getCompanyIcon(network)
            issues.push({
              contents: `The ${network} network is unavailable at this moment.`,
              icon: <CompanyIcon />
            })
            networksWithFeedWideErrors[network] = true
          }
        })

        // don't continue to next part which would be overall errors with
        // planning a trip with a certain mode combination
        return
      }

      // At this point, an error response involved an error with  planning a
      // trip with a certain mode combination
      const mode = humanReadableMode(error.requestParameters.mode)
      issues.push({
        contents: `No trip found for ${mode}. ${error.error.msg}`,
        icon: <Icon className='text-warning' type='exclamation-triangle' />
      })
    })

    let resultText, titleText
    if (pending) {
      resultText = 'Finding your options...'
      titleText = 'Finding your options...'
    } else {
      const itineraryPlural = itineraries.length === 1
        ? 'itinerary'
        : 'itineraries'
      const issuePlural = issues.length === 1
        ? 'issue'
        : 'issues'
      resultText = `${itineraries.length} ${itineraryPlural} found.`
      titleText = issues.length > 0
        ? `${itineraries.length} ${itineraryPlural} (and ${issues.length} ${issuePlural}) found`
        : resultText
    }

    return (
      <div
        className='options header'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexGrow: '0'
        }}
      >
        {itineraryIsExpanded
          ? <>
            <button
              className='clear-button-formatting'
              onClick={this._toggleDetailedItinerary}>
              <i className='fa fa-arrow-left' /> View all options
            </button>

            <SaveTripButton />
          </>
          : <>
            <div
              title={titleText}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
              <span>{resultText}</span>
              {issues.length > 0 && (
                <OverlayTrigger
                  overlay={(
                    <Tooltip id='narrative-issues-tooltip'>
                      <ListGroup>
                        {issues.map((issue, i) => (
                          <ListGroupItem key={i}>
                            <IssueContainer>
                              <IssueIconContainer>
                                {issue.icon}
                              </IssueIconContainer>
                              <IssueContents>
                                {issue.contents}
                              </IssueContents>
                            </IssueContainer>
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                    </Tooltip>
                  )}
                  placement='bottom'
                >
                  <IssueWell>
                    <i className='fa fa-warning' />
                    <span>{issues.length} issues</span>
                  </IssueWell>
                </OverlayTrigger>
              )}
            </div>
            <div style={{display: 'inherit'}} className='sort-options'>
              <button
                onClick={this._onSortDirChange} className='clear-button-formatting'
                style={{marginRight: '5px'}}>
                <i className={`fa fa-sort-amount-${sort.direction.toLowerCase()}`} />
              </button>
              <select
                onBlur={this._onSortChange}
                onChange={this._onSortChange}
                value={sort.value}>
                <option value='BEST'>Best option</option>
                <option value='DURATION'>Duration</option>
                <option value='ARRIVALTIME'>Arrival time</option>
                <option value='DEPARTURETIME'>Departure time</option>
                <option value='WALKTIME'>Walk time</option>
                <option value='COST'>Cost</option>
              </select>
            </div>
          </>
        }
      </div>
    )
  }

  _renderLoadingDivs = () => {
    const {itineraries, modes, pending} = this.props
    if (!pending) return null
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

    if (!activeSearch) return null

    const showRealtimeAnnotation = realtimeEffects.isAffectedByRealtimeData && (
      realtimeEffects.exceedsThreshold ||
      realtimeEffects.routesDiffer ||
      !useRealtime
    )

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
        </div>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const activeItinerary = activeSearch && activeSearch.activeItinerary
  const {modes} = state.otp.config
  const {sort} = state.otp.filter
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
    itineraries,
    itineraryIsExpanded,
    itineraryView,
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
