import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'

import { Button } from 'react-bootstrap'

import { hideInfoBar } from '../../actions/map'

class InfoBar extends Component {
  static propTypes = {
    // application state
    infoBarState: PropTypes.object,

    // dispatch
    hideInfoBar: PropTypes.func
  }

  render () {
    const { infoBarState } = this.props

    let title, body

    const setLocationButtons = <span>
      <Button bsStyle='primary' bsSize='small'><i className='fa fa-map-marker' /> Set Start</Button>{' '}
      <Button bsStyle='primary' bsSize='small'><i className='fa fa-star' /> Set End</Button>
    </span>

    switch (infoBarState.type) {
      case 'LOCATION':
        title = <span><i className='fa fa-location-arrow' /> {infoBarState.location.name}</span>
        body = <div>{setLocationButtons}</div>
        break
      case 'BIKE_RENTAL':
        title = <span><i className='fa fa-bicycle' /> {infoBarState.station.name}</span>
        body = <div>
          {!infoBarState.station.isFloatingBike
            ? <span>{infoBarState.station.bikesAvailable} Bikes / {infoBarState.station.spacesAvailable} Docks</span>
            : <span>Floating Bike</span>
          }
          {' '}{setLocationButtons}
        </div>
    }

    return (
      <div className='info-bar'>
        <div className='header'>
          <a className='close-button' onClick={() => { this.props.hideInfoBar() }}>
            <i className='fa fa-times' />
          </a>
          {title}
        </div>
        <div className='body'>{body}</div>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    infoBarState: state.otp.ui.infoBar
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    hideInfoBar: () => { dispatch(hideInfoBar()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoBar)
