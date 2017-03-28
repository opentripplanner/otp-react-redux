import React, {PropTypes, Component} from 'react'
import { connect } from 'react-redux'

import { planTrip } from '../actions/api'

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
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      if (initialProps.plan) {
        dispatch(planTrip())
      } else if (initialProps.start) {
        // TODO: handle loading start
      }
    },
    planTrip: () => { dispatch(planTrip()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OtpApp)
