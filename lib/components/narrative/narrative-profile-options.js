import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import NarrativeProfileSummary from './narrative-profile-summary'
import Loading from './loading'
import { getActiveSearch } from '../../util/state'
import { filterProfileOptions, profileOptionsToItineraries } from '../../util/profile'

class NarrativeProfileOptions extends Component {
  static propTypes = {
    options: PropTypes.array,
    itineraryClass: PropTypes.func,
    pending: PropTypes.bool,
    activeOption: PropTypes.number,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    customIcons: PropTypes.object
  }

  static defaultProps = {
    itineraryClass: DefaultItinerary
  }

  render () {
    const { pending, itineraryClass } = this.props
    if (pending) return <Loading />

    let options = this.props.options
    if (!options) return null

    options = filterProfileOptions(options)
    const itineraries = profileOptionsToItineraries(options)

    return (
      <div className='options itinerary profile'>
        <div className='header'>Your best options:</div>
        <NarrativeProfileSummary options={options} customIcons={this.props.customIcons} />
        <div className='header'>We found <strong>{options.length}</strong> total options:</div>
        {itineraries.map((itinerary, index) => {
          return React.createElement(itineraryClass, {
            itinerary,
            index,
            key: index,
            active: true,
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
  const pending = activeSearch && activeSearch.pending
  return {
    options:
      activeSearch &&
      activeSearch.profileResponse &&
      activeSearch.profileResponse.otp
        ? activeSearch.profileResponse.otp.profile
        : null,
    pending,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setActiveItinerary: (index) => { dispatch(setActiveItinerary({ index })) },
    setActiveLeg: (index, leg) => { dispatch(setActiveLeg({ index, leg })) },
    setActiveStep: (index, step) => { dispatch(setActiveStep({ index, step })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NarrativeProfileOptions)
