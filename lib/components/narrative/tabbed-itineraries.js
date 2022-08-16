// TODO: typescript
/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as narrativeActions from '../../actions/narrative'
import { ComponentContext } from '../../util/contexts'
import { getActiveSearch, getFare, getRealtimeEffects } from '../../util/state'
import { getTimeFormat } from '../../util/i18n'
import ErrorMessage from '../form/error-message'
import FormattedDuration from '../util/formatted-duration'
import Icon from '../util/icon'

import { FLEX_COLOR } from './default/flex-indicator'

const { calculatePhysicalActivity, getTimeZoneOffset, isTransit } =
  coreUtils.itinerary

const Bullet = styled.span`
  ::before {
    content: '•';
    margin: 0 0.25em;
  }
`

class TabButton extends Component {
  _onClick = () => {
    const { index, onClick } = this.props
    // FIXME: change signature once actions resolved with otp-ui
    onClick(index)
  }

  render() {
    const { currency, defaultFareKey, index, isActive, itinerary } = this.props
    const timezoneOffset = getTimeZoneOffset(itinerary)
    const classNames = ['tab-button', 'clear-button-formatting']
    const { caloriesBurned } = calculatePhysicalActivity(itinerary)
    const { fareCurrency, maxTNCFare, minTNCFare, transitFare } = getFare(
      itinerary,
      defaultFareKey,
      currency
    )
    const minTotalFare = minTNCFare * 100 + transitFare
    const startTime = itinerary.startTime + timezoneOffset
    const endTime = itinerary.endTime + timezoneOffset
    const mustCallAhead = itinerary.legs.some(
      coreUtils.itinerary.isReservationRequired
    )
    const transitFareNotProvided = itinerary.legs.some(
      (leg) => isTransit(leg.mode) && transitFare == null
    )

    if (isActive) classNames.push('selected')
    return (
      <Button
        className={classNames.join(' ')}
        key={`tab-button-${index}`}
        onClick={this._onClick}
      >
        <span className="title">
          {mustCallAhead && (
            <Icon name="volume-control-phone" style={{ color: FLEX_COLOR }} />
          )}
          <FormattedMessage
            id="components.TabbedItineraries.optionNumber"
            values={{ optionNum: index + 1 }}
          />
        </span>
        <span className="details">
          {mustCallAhead && (
            <span style={{ color: FLEX_COLOR }}>
              <FormattedMessage id="components.TabbedItineraries.mustCallAhead" />
            </span>
          )}
          <span>
            {/* The itinerary duration in hrs/mins */}
            <FormattedDuration duration={itinerary.duration} />
          </span>
          {/* The duration as a time range */}
          <span>
            <FormattedMessage
              id="common.time.departureArrivalTimes"
              values={{
                endTime,
                startTime
              }}
            />
          </span>
          {/* the fare / calories summary line */}
          <span>
            {/* Display "No Fare Info" if there is a transit leg w/o fare information */}
            {transitFareNotProvided ? (
              <>
                <FormattedMessage id="common.itineraryDescriptions.noTransitFareProvided" />
                <Bullet />
              </>
            ) : (
              minTotalFare > 0 && (
                <>
                  <FormattedMessage
                    id="components.TabbedItineraries.fareCost"
                    values={{
                      hasMaxFare: maxTNCFare && maxTNCFare > minTNCFare,
                      minTotalFare: (
                        <FormattedNumber
                          currency={fareCurrency}
                          currencyDisplay="narrowSymbol"
                          // This isn't a "real" style prop
                          // eslint-disable-next-line react/style-prop-object
                          style="currency"
                          value={minTotalFare / 100}
                        />
                      )
                    }}
                  />
                  <Bullet />
                </>
              )
            )}
            <FormattedMessage
              id="common.itineraryDescriptions.calories"
              values={{ calories: Math.round(caloriesBurned) }}
            />
          </span>
          {/* The 'X tranfers' line, if applicable */}
          <span>
            <FormattedMessage
              id="common.itineraryDescriptions.transfers"
              values={{ transfers: itinerary.transfers }}
            />
          </span>
        </span>
      </Button>
    )
  }
}

class TabbedItineraries extends Component {
  static propTypes = {
    activeItinerary: PropTypes.number,
    itineraries: PropTypes.array,
    pending: PropTypes.bool,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  static contextType = ComponentContext

  render() {
    const {
      activeItinerary,
      currency,
      defaultFareKey,
      error,
      itineraries,
      realtimeEffects,
      setActiveItinerary,
      timeFormat,
      ...itineraryBodyProps
    } = this.props
    const { ItineraryBody, LegIcon } = this.context

    if (!itineraries) return null

    /* TODO: should this be moved? */
    const showRealtimeAnnotation =
      realtimeEffects.isAffectedByRealtimeData &&
      (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer)
    return (
      <div className="options itinerary tabbed-itineraries">
        {error && itineraries && <ErrorMessage error={error} warning />}
        <div className="tab-row">
          {itineraries.map((itinerary, index) => {
            return (
              <TabButton
                currency={currency}
                defaultFareKey={defaultFareKey}
                index={index}
                isActive={index === activeItinerary}
                itinerary={itinerary}
                key={index}
                onClick={setActiveItinerary}
              />
            )
          })}
        </div>

        {/* Show active itin if itineraries exist and active itin is defined. */}
        {itineraries.length > 0 && activeItinerary >= 0 ? (
          <ItineraryBody
            active
            expanded
            index={activeItinerary}
            itinerary={itineraries[activeItinerary]}
            key={activeItinerary}
            LegIcon={LegIcon}
            routingType="ITINERARY"
            showRealtimeAnnotation={showRealtimeAnnotation}
            timeFormat={timeFormat}
            {...itineraryBodyProps}
          />
        ) : null}
      </div>
    )
  }
}
// connect to the redux store

const mapStateToProps = (state) => {
  const activeSearch = getActiveSearch(state)
  const currency = state.otp.config.localization?.currency || 'USD'
  const pending = activeSearch ? Boolean(activeSearch.pending) : false
  const realtimeEffects = getRealtimeEffects(state)

  return {
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    companies: state.otp.currentQuery.companies,
    currency,
    defaultFareKey: state.otp.config.itinerary?.defaultFareKey,
    pending,
    // swap out realtime itineraries with non-realtime depending on boolean
    realtimeEffects,
    timeFormat: getTimeFormat(state),
    tnc: state.otp.tnc
  }
}

const mapDispatchToProps = (dispatch) => {
  const { setActiveItinerary, setActiveLeg, setActiveStep } = narrativeActions
  return {
    // FIXME
    setActiveItinerary: (index) => {
      dispatch(setActiveItinerary({ index }))
    },
    // FIXME
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({ index, leg }))
    },
    // FIXME
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({ index, step }))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TabbedItineraries)
