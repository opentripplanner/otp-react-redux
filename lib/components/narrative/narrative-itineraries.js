import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveSearch } from '../../util/state'

class NarrativeItineraries extends Component {
  static propTypes = {
    itineraries: PropTypes.array,
    itineraryClass: PropTypes.func,
    pending: PropTypes.bool,
    activeItinerary: PropTypes.number,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  static defaultProps = {
    itineraryClass: DefaultItinerary
  }

  render () {
    const { itineraries, activeItinerary, itineraryClass } = this.props
    if (!itineraries) return null

    return (
      <div className='options itinerary'>
        <div className='header'>We found {itineraries.length} itineraries:</div>

        <div style={{ border: '2px solid red', padding: '12px 20px', marginBottom: '20px', backgroundColor: '#FFE4C4' }}>
          <div style={{ float: 'left', fontSize: '40px', color: 'red' }}>
            <i className='fa fa-exclamation-triangle' />
          </div>
          <div style={{ marginLeft: '60px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px', lineHeight: '24px' }}>
              This Itinerary was Impacted by Real Time Service Disruptions
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              Under normal conditions, this trip would take <b>18 minutes</b> using the following routes: <b>MAX Yellow Line</b>.
            </div>
            <div style={{ marginTop: '6px' }}>
              <Button bsSize='xsmall' bsStyle='danger'>View Default Itinerary</Button>
            </div>
          </div>
        </div>

        {itineraries.map((itinerary, index) => {
          return React.createElement(itineraryClass, {
            itinerary,
            index,
            key: index,
            active: index === activeItinerary,
            ...this.props
          })
        })}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}
  const pending = activeSearch ? activeSearch.pending : false
  return {
    itineraries:
      activeSearch &&
      activeSearch.response &&
      activeSearch.response.plan
        ? activeSearch.response.plan.itineraries
        : null,
    pending,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setActiveItinerary: index => {
      dispatch(setActiveItinerary({index}))
    },
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({index, leg}))
    },
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({index, step}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  NarrativeItineraries
)
