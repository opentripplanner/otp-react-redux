import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import { connect } from 'react-redux'

import * as narrativeActions from '../../actions/narrative'
import { ComponentContext } from '../../util/contexts'
import { getActiveSearch, getRealtimeEffects } from '../../util/state'
import { FormattedDuration } from '../util/format-duration'
import { FormattedTime } from '../util/format-time'

const { calculateFares, calculatePhysicalActivity } = coreUtils.itinerary

class TabbedItineraries extends Component {
  static propTypes = {
    activeItinerary: PropTypes.number,
    itineraries: PropTypes.array,
    pending: PropTypes.bool,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    setUseRealtimeResponse: PropTypes.func,
    useRealtime: PropTypes.bool
  }

  static contextType = ComponentContext

  _toggleRealtimeItineraryClick = (e) => {
    const { setUseRealtimeResponse, useRealtime } = this.props
    setUseRealtimeResponse({ useRealtime: !useRealtime })
  }

  render () {
    const {
      activeItinerary,
      currency,
      itineraries,
      realtimeEffects,
      setActiveItinerary,
      use24HourFormat,
      useRealtime,
      ...itineraryBodyProps
    } = this.props
    const { ItineraryBody, LegIcon } = this.context
    const timeFormat = use24HourFormat ? 'H:mm' : 'h:mm a'

    if (!itineraries) return null

    /* TODO: should this be moved? */
    const showRealtimeAnnotation =
      realtimeEffects.isAffectedByRealtimeData && (
        realtimeEffects.exceedsThreshold ||
        realtimeEffects.routesDiffer ||
        !useRealtime
      )
    return (
      <div className='options itinerary tabbed-itineraries'>
        <div className='tab-row'>
          {itineraries.map((itinerary, index) => {
            return (
              <TabButton
                currency={currency}
                index={index}
                isActive={index === activeItinerary}
                itinerary={itinerary}
                onClick={setActiveItinerary}
                timeFormat={timeFormat}
              />
            )
          })}
        </div>

        {/* <RealtimeAnnotation
          realtimeEffects={realtimeEffects}
          toggleRealtime={this._toggleRealtimeItineraryClick}
          useRealtime={useRealtime} />
        */}

        {/* Show active itin if itineraries exist and active itin is defined. */}
        {(itineraries.length > 0 && activeItinerary >= 0)
          ? (
            <ItineraryBody
              active
              expanded
              index={activeItinerary}
              itinerary={itineraries[activeItinerary]}
              key={activeItinerary}
              LegIcon={LegIcon}
              routingType='ITINERARY'
              showRealtimeAnnotation={showRealtimeAnnotation}
              timeFormat={timeFormat}
              {...itineraryBodyProps}
            />
          )
          : null
        }

      </div>
    )
  }
}

class TabButton extends Component {
  _onClick = () => {
    const {index, onClick} = this.props
    // FIXME: change signature once actions resolved with otp-ui
    onClick(index)
  }

  render () {
    const {currency, index, isActive, itinerary, timeFormat} = this.props
    const classNames = ['tab-button', 'clear-button-formatting']
    const { caloriesBurned } = calculatePhysicalActivity(itinerary)
    const {
      maxTNCFare,
      minTNCFare,
      transitFare
    } = calculateFares(itinerary)
    // TODO: support non-USD
    const minTotalFare = minTNCFare * 100 + transitFare
    if (isActive) classNames.push('selected')
    return (
      <Button
        className={classNames.join(' ')}
        key={`tab-button-${index}`}
        onClick={this._onClick}
      >
        <div className='title'>
          <span>
            <FormattedMessage
              id='components.TabbedItineraries.optionNumber'
              values={{optionNum: index + 1}}
            />
          </span>
        </div>
        <div className='details'>
          {/* The itinerary duration in hrs/mins */}
          <FormattedDuration duration={itinerary.duration} />

          {/* The duration as a time range */}
          <span>
            <br />
            <FormattedTime
              endTime={itinerary.endTime}
              startTime={itinerary.startTime}
              timeFormat={timeFormat}
            />
          </span>

          {/* the fare / calories summary line */}
          <span>
            <br />
            {minTotalFare ? <span> <FormattedMessage
              id='components.TabbedItineraries.fareCost'
              values={{
                minTotalFare: (
                  <FormattedNumber
                    currency={currency}
                    currencyDisplay='narrowSymbol'
                    style='currency'
                    value={minTotalFare / 100}
                  />
                ),
                useMaxFare: maxTNCFare && maxTNCFare > minTNCFare ? 'true' : 'false'
              }}
            /> &bull; </span> : ''}
            <FormattedMessage
              id='common.itineraryDescriptions.calories'
              values={{calories: Math.round(caloriesBurned)}}
            />
          </span>

          {/* The 'X tranfers' line, if applicable */}
          <span>
            <br />
            <FormattedMessage id='common.itineraryDescriptions.transfers' values={{transfers: itinerary.transfers}} />
          </span>

        </div>
      </Button>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state)
  const currency = state.otp.config.localization?.currency || 'USD'
  const pending = activeSearch ? Boolean(activeSearch.pending) : false
  const realtimeEffects = getRealtimeEffects(state)
  const useRealtime = state.otp.useRealtime
  const use24HourFormat = state.user.loggedInUser?.use24HourFormat ?? false

  return {
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    companies: state.otp.currentQuery.companies,
    currency,
    pending,
    // swap out realtime itineraries with non-realtime depending on boolean
    realtimeEffects,
    tnc: state.otp.tnc,
    use24HourFormat,
    useRealtime
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const {setActiveItinerary, setActiveLeg, setActiveStep, setUseRealtimeResponse} = narrativeActions
  return {
    // FIXME
    setActiveItinerary: (index) => {
      dispatch(setActiveItinerary({index}))
    },
    // FIXME
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({index, leg}))
    },
    // FIXME
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({index, step}))
    },
    // FIXME
    setUseRealtimeResponse: ({useRealtime}) => {
      dispatch(setUseRealtimeResponse({useRealtime}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  TabbedItineraries
)
