import lonlat from '@conveyal/lonlat'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { FormGroup, FormControl, InputGroup, DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { autocomplete } from 'isomorphic-mapzen-search'

import { setLocation, setLocationToCurrent, clearLocation } from '../../actions/map'
import { addLocationSearch } from '../../actions/location'
import { distanceStringImperial } from '../../util/distance'

class LocationField extends Component {
  static propTypes = {
    config: PropTypes.object,
    currentPosition: PropTypes.object,
    location: PropTypes.object,
    label: PropTypes.string,
    nearbyStops: PropTypes.array,
    sessionSearches: PropTypes.array,
    static: PropTypes.bool,
    stopsIndex: PropTypes.object,
    type: PropTypes.string, // replace with locationType?

    // callbacks
    onClick: PropTypes.func,

    // dispatch
    addLocationSearch: PropTypes.func,
    clearLocation: PropTypes.func,
    setLocation: PropTypes.func,
    setLocationToCurrent: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      value: props.location !== null ? props.location.name : '',
      menuVisible: false,
      geocodedFeatures: []
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.location !== nextProps.location) {
      this.setState({
        value: nextProps.location !== null ? nextProps.location.name : '',
        geocodedFeatures: []
      })
    }
  }

  componentDidMount () {
    if (this.props.static) {
      ReactDOM.findDOMNode(this.refs['formControl']).focus()
    }
  }

  _geocode (text) {
    const { config } = this.props
    autocomplete({
      apiKey: config.geocoder.MAPZEN_KEY,
      boundary: config.geocoder.boundary,
      // TODO: use current location as focus point
      text
    }).then((result) => {
      console.log(result)
      this.setState({ geocodedFeatures: result.features })
    }).catch((err) => {
      console.error(err)
    })
  }

  _setLocation (location) {
    this.props.setLocation(this.props.type, location)
  }

  render () {
    const { currentPosition } = this.props

    const currentLocationOption = currentPosition !== null
      ? createOption('location-arrow', 'Use Current Location', () => {
        this.props.setLocationToCurrent(this.props.type)
      })
      : null

    let geocodedFeatures = this.state.geocodedFeatures
    if (geocodedFeatures.length > 5) geocodedFeatures = geocodedFeatures.slice(0, 5)

    let nearbyStops = this.props.nearbyStops
    if (nearbyStops.length > 4) nearbyStops = nearbyStops.slice(0, 3)

    let sessionSearches = this.props.sessionSearches
    if (sessionSearches.length > 5) sessionSearches = sessionSearches.slice(0, 5)

    const formControlClassname = this.props.type + '-form-control'

    // assemble menu contents, to be displayed either as dropdown or static panel
    let menuItems = []
    menuItems.push(currentLocationOption)

    // geocode search result option(s)
    if (geocodedFeatures.length > 0) {
      menuItems.push(<MenuItem header key='sr-header'>Search Results</MenuItem>)
      menuItems = menuItems.concat(geocodedFeatures.map(feature => {
        return createOption('map-pin', feature.properties.label, () => {
          const location = lonlat.fromCoordinates(feature.geometry.coordinates)
          location.name = feature.properties.label

          // set the current location
          this._setLocation(location)

          // add to the location search history
          this.props.addLocationSearch(location)
        })
      }))
    }

    // nearby transit stop options
    if (nearbyStops.length > 0) {
      menuItems.push(<MenuItem header key='ns-header'>Nearby Stops</MenuItem>)
      menuItems = menuItems.concat(nearbyStops.map(stopId => {
        const stop = this.props.stopsIndex[stopId]
        return createTransitStopOption(stop, () => {
          this._setLocation({
            name: stop.name,
            lat: stop.lat,
            lon: stop.lon
          })
        })
      }))
    }

    // recent search history options
    if (sessionSearches.length > 0) {
      menuItems.push(<MenuItem header key='ss-header'>Recently Searched</MenuItem>)
      menuItems = menuItems.concat(sessionSearches.map(location => {
        return createOption('search', location.name, () => {
          // set the current location
          this._setLocation(location)
        })
      }))
    }

    /** the text input element **/
    const textControl = <FormControl ref='formControl'
      className={formControlClassname}
      type='text'
      value={this.state.value}
      placeholder={this.props.label || this.props.type}
      onChange={(e) => {
        this.setState({ value: e.target.value })
        this._geocode(e.target.value)
      }}
      onClick={() => {
        if (typeof this.props.onClick === 'function') this.props.onClick()
        this.setState({ menuVisible: true })
      }}
    />

    /** the clear ('X') button add-on */
    const clearButton = <InputGroup.Addon onClick={() => {
      this.props.clearLocation(this.props.type)
      this.setState({
        value: '',
        geocodedFeatures: []
      })
    }}>
      <i className='fa fa-times' />
    </InputGroup.Addon>

    if (this.props.static) { // 'static' mode (menu is displayed alongside input)
      return (
        <div className='location-field static'>
          <form>
            <FormGroup>
              <InputGroup>
                <InputGroup.Addon>
                  <i className={`fa fa-${this.props.type === 'from' ? 'star' : 'map-marker'}`} />
                </InputGroup.Addon>
                {textControl}
                {clearButton}
              </InputGroup>
            </FormGroup>
          </form>
          <ul className='dropdown-menu'>
            {menuItems}
          </ul>
        </div>
      )
    } else { // default display mode with dropdown menu
      return (
        <form>
          <FormGroup className='location-field'>
            <InputGroup>
              {/* location field icon -- also serves as dropdown anchor */}
              <DropdownButton
                componentClass={InputGroup.Button}
                open={this.state.menuVisible}
                onToggle={(v, e) => {
                  // if clicked on input form control, keep dropdown open; otherwise, toggle
                  const targetIsInput = e.target.className.indexOf(formControlClassname) !== -1
                  this.setState({ menuVisible: targetIsInput ? true : !this.state.menuVisible })
                }}
                id='location-dropdown'
                title={<i className={`fa fa-${this.props.type === 'from' ? 'star' : 'map-marker'}`} />}
                noCaret
              >
                {menuItems}
              </DropdownButton>
              {textControl}
              {clearButton}
            </InputGroup>
          </FormGroup>
        </form>
      )
    }
  }
}

// helper functions for dropdown options

let itemKey = 0

function createOption (icon, title, onSelect) {
  return <MenuItem className='location-option' onSelect={onSelect} key={itemKey++}>
    <div>
      <div style={{ float: 'left' }}><i className={`fa fa-${icon}`} /></div>
      <div style={{ marginLeft: '30px' }}>{title}</div>
    </div>
  </MenuItem>
}

function createTransitStopOption (stop, onSelect) {
  return <MenuItem className='location-option' onSelect={onSelect} key={itemKey++}>
    <div>
      <div style={{ float: 'left', paddingTop: '3px' }}>
        <i className='fa fa-bus' style={{ fontSize: '20px' }} />
        <div style={{ fontSize: '8px' }}>{distanceStringImperial(stop.dist, true)}</div>
      </div>
      <div style={{ marginLeft: '30px' }}>
        <div>{stop.name} ({stop.code})</div>
        <div style={{ fontSize: '9px' }}>
          {(stop.routes || []).map((route, i) => {
            const name = route.shortName || route.longName
            return (
              <span key={`route-${i}`} className='route'>
                {name}
              </span>
            )
          })}
        </div>
      </div>
      <div style={{ clear: 'both' }} />
    </div>
  </MenuItem>
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    location: state.otp.currentQuery[ownProps.type],
    currentPosition: state.otp.location.currentPosition,
    sessionSearches: state.otp.location.sessionSearches,
    nearbyStops: state.otp.location.nearbyStops,
    stopsIndex: state.otp.transitIndex.stops
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addLocationSearch: (location) => { dispatch(addLocationSearch({ location })) },
    setLocation: (type, location) => { dispatch(setLocation({ type, location })) },
    setLocationToCurrent: (type) => { dispatch(setLocationToCurrent({ type })) },
    clearLocation: (type) => { dispatch(clearLocation({ type })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationField)
