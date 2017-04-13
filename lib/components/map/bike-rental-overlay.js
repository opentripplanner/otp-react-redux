import { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { bikeRentalQuery } from '../../actions/api'

class BikeRentalOverlay extends Component {
  static propTypes = {
    stations: PropTypes.array,
    refreshStations: PropTypes.func
  }

  componentDidMount () {
    console.log('refreshing bike stations');
    this.state.refreshStations()
  }

  render () {
    // const { from, to } = this.props.query
    console.log('render stations: ' + this.props.stations)
    return null
    /*return (
      <div>
        <Endpoint type='from' location={from} {...this.props} />
        <Endpoint type='to' location={to} {...this.props} />
      </div>
    )*/
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    stations: state.otp.overlay.bike_rental.stations
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    refreshStations: () => { dispatch(bikeRentalQuery()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BikeRentalOverlay)
