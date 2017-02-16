import React, {PropTypes, Component} from 'react'
import { connect } from 'react-redux'

import { planTrip } from '../actions/api'
import { updateMapState } from '../actions/map'

class OtpApp extends Component {
  static propTypes = {
    // children: PropTypes.array,
    history: PropTypes.object
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    const {
      children
    } = this.props
    return (
      <div className='otp'>
        {children}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const plan = ownProps.route && ownProps.route.path.indexOf('/plan') !== -1
  const start = ownProps.route && ownProps.route.path.indexOf('@') === 0
  return {
    plan,
    start
    // activeLeg: activeSearch && activeSearch.activeLeg,
    // activeStep: activeSearch && activeSearch.activeStep,
    // config: state.otp.config,
    // isFromSet: state.otp.currentQuery.from && state.otp.currentQuery.from.lat && state.otp.currentQuery.from.lon,
    // isToSet: state.otp.currentQuery.to && state.otp.currentQuery.to.lat && state.otp.currentQuery.to.lon,
    // itinerary: getActiveItinerary(state.otp)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      console.log(initialProps.plan, initialProps)
      if (initialProps.plan) {
        console.log('planning trip')
        dispatch(planTrip())
      } else if (initialProps.start) {
        // TODO: handle loading start
        // dispatch(updateMapState(initialProps.routeParams))
      }
    },
    planTrip: () => { dispatch(planTrip()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OtpApp)
