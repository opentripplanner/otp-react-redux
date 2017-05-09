import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'

import { Button } from 'react-bootstrap'

import { setLocation, hideInfoBar } from '../../actions/map'

class InfoBar extends Component {
  static propTypes = {
    // application state
    infoBarState: PropTypes.object,

    // dispatch
    hideInfoBar: PropTypes.func,
    setLocation: PropTypes.func
  }

  _setLocation (fromTo) {
    const { infoBarState, setLocation } = this.props
    let location
    switch (infoBarState.type) {
      case 'LOCATION':
        location = infoBarState.location
        break
      case 'BIKE_RENTAL':
        location = {
          name: infoBarState.station.name,
          lat: infoBarState.station.y,
          lon: infoBarState.station.x
        }
        break
      default:
        return
    }
    setLocation(fromTo, location)
  }

  render () {
    const { infoBarState } = this.props

    let title, body

    const setLocationButtons = <div className='buttons'>
      <Button bsStyle='primary' bsSize='small' onClick={() => this._setLocation('from')} pullRight>
        <i className='fa fa-map-marker' /> Set Start
      </Button>
      {' '}
      <Button bsStyle='primary' bsSize='small' onClick={() => this._setLocation('to')}>
        <i className='fa fa-star' /> Set End
      </Button>
    </div>

    switch (infoBarState.type) {
      case 'LOCATION':
        title = <span><i className='fa fa-location-arrow' /> {infoBarState.location.name}</span>
        body = <div>{setLocationButtons}</div>
        break
      case 'BIKE_RENTAL':
        title = <span><i className='fa fa-bicycle' /> {infoBarState.station.name}</span>
        body = <div>
          {setLocationButtons}
          {!infoBarState.station.isFloatingBike
            ? <span>{infoBarState.station.bikesAvailable} Bikes / {infoBarState.station.spacesAvailable} Docks</span>
            : <span>Floating Bike</span>
          }
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
    hideInfoBar: () => { dispatch(hideInfoBar()) },
    setLocation: (type, location) => { dispatch(setLocation({ type, location })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoBar)
