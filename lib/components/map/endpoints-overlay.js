import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Marker } from 'react-leaflet'

class BaseMap extends Component {

  static propTypes = {
    query: PropTypes.object
  }

  render () {
    const from = this.props.query.from
    const fromPos = from && from.lat && from.lon ? [from.lat, from.lon] : null

    const to = this.props.query.to
    const toPos = to && to.lat && to.lon ? [to.lat, to.lon] : null

    return (<div>
      {fromPos ? <Marker position={fromPos} /> : null}
      {toPos ? <Marker position={toPos} /> : null}
    </div>)
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseMap)
